import { Request, Response } from 'express';
import Form from '../models/Form';
import FormSubmission from '../models/FormSubmission';
import { sendSubmissionConfirm } from '../services/email';

// ── 公開 ──────────────────────────────────────────────

// 取得所有開放中、未截止的表單列表
export const getOpenForms = async (req: Request, res: Response): Promise<void> => {
  const type = req.query.type as string | undefined;
  const filter: Record<string, unknown> = {
    isOpen: true,
    deadline: { $gte: new Date() },
  };
  if (type === 'event' || type === 'group_buy') filter.type = type;

  const forms = await Form.find(filter)
    .sort({ deadline: 1 })
    .select('-__v');
  res.json(forms);
};

// 取得單一表單（含自訂欄位）
// 無論開放狀態一律回傳，前台依 status 決定顯示內容；submitForm 才做嚴格驗證
export const getFormById = async (req: Request, res: Response): Promise<void> => {
  const form = await Form.findById(req.params.id);
  if (!form) {
    res.status(404).json({ message: '表單不存在' });
    return;
  }

  const now = new Date();
  let status: 'open' | 'closed' | 'expired';
  if (!form.isOpen) {
    status = 'closed';
  } else if (form.deadline < now) {
    status = 'expired';
  } else {
    status = 'open';
  }

  const submissionCount = await FormSubmission.countDocuments({ formId: form._id });
  res.json({ ...form.toObject(), status, submissionCount });
};

// 送出報名
export const submitForm = async (req: Request, res: Response): Promise<void> => {
  const form = await Form.findOne({
    _id: req.params.id,
    isOpen: true,
    deadline: { $gte: new Date() },
  });
  if (!form) {
    res.status(404).json({ message: '表單不存在或已截止' });
    return;
  }

  const { name, email, phone, answers, quantity = 1 } = req.body;

  // 必填欄位基本驗證
  if (!name || !email || !phone) {
    res.status(400).json({ message: '請填寫姓名、Email 及手機號碼' });
    return;
  }

  // 檢查自訂必填欄位
  for (const field of form.fields) {
    if (field.required && !answers?.[field.key]) {
      res.status(400).json({ message: `「${field.label}」為必填欄位` });
      return;
    }
  }

  // 防重複報名：同一表單，email 或 phone 已存在
  const duplicate = await FormSubmission.findOne({
    formId: form._id,
    $or: [
      { email: email.toLowerCase().trim() },
      { phone: phone.trim() },
    ],
  });
  if (duplicate) {
    res.status(409).json({ message: '此 Email 或手機號碼已完成報名，請勿重複送出' });
    return;
  }

  // 額滿檢查
  if (form.totalLimit && form.totalLimit > 0) {
    const count = await FormSubmission.countDocuments({ formId: form._id });
    if (count >= form.totalLimit) {
      res.status(400).json({ message: '報名人數已達上限' });
      return;
    }
  }

  // 數量上限
  const qty = Math.max(1, Math.min(quantity, form.maxQuantity ?? 1));
  const totalAmount = form.price ? form.price * qty : 0;

  const submission = await FormSubmission.create({
    formId: form._id,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    answers: answers ?? {},
    quantity: qty,
    totalAmount,
  });

  // 寄確認信（非同步，失敗不影響報名結果）
  const fieldLabels: Record<string, string> = {};
  form.fields.forEach((f) => { fieldLabels[f.key] = f.label; });

  sendSubmissionConfirm({
    to: submission.email,
    name: submission.name,
    formTitle: form.title,
    formType: form.type,
    quantity: qty,
    totalAmount,
    answers: Object.fromEntries(submission.answers),
    fieldLabels,
  }).catch((err) => {
    console.error('Email 寄送失敗:', err.message);
  });

  res.status(201).json({ message: '報名成功', submissionId: submission._id });
};

// ── CMS ──────────────────────────────────────────────

// 取得所有表單（含未開放）
export const getAllForms = async (_req: Request, res: Response): Promise<void> => {
  const forms = await Form.find().sort({ createdAt: -1 }).select('-__v');
  res.json(forms);
};

// 新增表單
export const createForm = async (req: Request, res: Response): Promise<void> => {
  const form = await Form.create(req.body);
  res.status(201).json(form);
};

// 更新表單
export const updateForm = async (req: Request, res: Response): Promise<void> => {
  const form = await Form.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!form) {
    res.status(404).json({ message: '表單不存在' });
    return;
  }
  res.json(form);
};

// 刪除表單（同步刪除所有報名紀錄）
export const deleteForm = async (req: Request, res: Response): Promise<void> => {
  const form = await Form.findByIdAndDelete(req.params.id);
  if (!form) {
    res.status(404).json({ message: '表單不存在' });
    return;
  }
  await FormSubmission.deleteMany({ formId: req.params.id });
  res.json({ message: '刪除成功' });
};

// 取得表單報名明細 + 統計
export const getFormSubmissions = async (req: Request, res: Response): Promise<void> => {
  const form = await Form.findById(req.params.id);
  if (!form) {
    res.status(404).json({ message: '表單不存在' });
    return;
  }

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = 30;
  const skip = (page - 1) * limit;

  const [submissions, total] = await Promise.all([
    FormSubmission.find({ formId: form._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v'),
    FormSubmission.countDocuments({ formId: form._id }),
  ]);

  // 統計
  const allSubmissions = await FormSubmission.find({ formId: form._id });
  const totalQuantity = allSubmissions.reduce((sum, s) => sum + s.quantity, 0);
  const totalAmount = allSubmissions.reduce((sum, s) => sum + s.totalAmount, 0);

  // 各選項分佈（select / radio / checkbox 類型欄位）
  const optionStats: Record<string, Record<string, number>> = {};
  for (const field of form.fields) {
    if (['select', 'radio', 'checkbox'].includes(field.type)) {
      optionStats[field.key] = {};
      for (const sub of allSubmissions) {
        const val = sub.answers.get(field.key);
        if (!val) continue;
        const vals = Array.isArray(val) ? val : [String(val)];
        vals.forEach((v) => {
          optionStats[field.key][v] = (optionStats[field.key][v] ?? 0) + 1;
        });
      }
    }
  }

  res.json({
    form,
    submissions,
    total,
    totalPages: Math.ceil(total / limit),
    stats: { totalQuantity, totalAmount, optionStats },
  });
};

// 匯出 CSV
export const exportSubmissionsCsv = async (req: Request, res: Response): Promise<void> => {
  const form = await Form.findById(req.params.id);
  if (!form) {
    res.status(404).json({ message: '表單不存在' });
    return;
  }

  const submissions = await FormSubmission.find({ formId: form._id }).sort({ createdAt: 1 });

  const fieldKeys = form.fields.map((f) => f.key);
  const fieldLabels = form.fields.map((f) => f.label);

  const header = ['姓名', 'Email', '手機', '數量', '金額', ...fieldLabels, '報名時間'].join(',');
  const rows = submissions.map((s) => {
    const base = [
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.phone}"`,
      s.quantity,
      s.totalAmount,
    ];
    const answerCols = fieldKeys.map((k) => {
      const val = s.answers.get(k) ?? '';
      const str = Array.isArray(val) ? val.join('、') : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    });
    base.push(...answerCols);
    base.push(`"${new Date(s.createdAt).toLocaleString('zh-TW')}"`);
    return base.join(',');
  });

  const csv = [header, ...rows].join('\n');
  const filename = encodeURIComponent(`${form.title}_報名名單.csv`);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${filename}`);
  res.send('\uFEFF' + csv); // BOM for Excel
};

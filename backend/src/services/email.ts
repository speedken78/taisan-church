import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Gmail App Password
  },
});

interface SubmissionConfirmOptions {
  to: string;
  name: string;
  formTitle: string;
  formType: 'event' | 'group_buy';
  quantity: number;
  totalAmount: number;
  answers: Record<string, string | number | string[]>;
  fieldLabels: Record<string, string>; // key -> label 對照
}

export async function sendSubmissionConfirm(opts: SubmissionConfirmOptions): Promise<void> {
  const typeLabel = opts.formType === 'group_buy' ? '團購' : '活動報名';

  const answersHtml = Object.entries(opts.answers)
    .map(([key, val]) => {
      const label = opts.fieldLabels[key] ?? key;
      const value = Array.isArray(val) ? val.join('、') : String(val);
      return `<tr><td style="padding:4px 12px;color:#666;">${label}</td><td style="padding:4px 12px;">${value}</td></tr>`;
    })
    .join('');

  const amountRow =
    opts.totalAmount > 0
      ? `<p style="margin-top:12px;font-size:15px;">應付金額：<strong>NT$ ${opts.totalAmount.toLocaleString()}</strong>（數量 ${opts.quantity} 份）</p>`
      : '';

  const html = `
<div style="font-family:sans-serif;max-width:560px;margin:auto;color:#333;">
  <h2 style="color:#F5B800;">泰山幸福教會${typeLabel}確認通知</h2>
  <p>您好，<strong>${opts.name}</strong>，感謝您的${typeLabel}！</p>
  <p>活動名稱：<strong>${opts.formTitle}</strong></p>
  <table style="border-collapse:collapse;width:100%;margin-top:8px;background:#f9f9f9;border-radius:8px;overflow:hidden;">
    ${answersHtml}
  </table>
  ${amountRow}
  <p style="margin-top:20px;font-size:13px;color:#999;">
    如有任何問題，請聯絡我們：taishanhappinesschurch@gmail.com ｜ 02-2900-8100
  </p>
</div>`;

  await transporter.sendMail({
    from: `"泰山幸福教會" <${process.env.SMTP_USER}>`,
    to: opts.to,
    subject: `【泰山幸福教會】${opts.formTitle} ${typeLabel}確認`,
    html,
  });
}

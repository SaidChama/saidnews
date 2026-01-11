import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_SMTP_HOST,
	port: parseInt(process.env.EMAIL_SMTP_PORT),
	auth: {
		user: process.env.EMAIL_SMTP_USER,
		pass: process.env.EMAIL_SMTP_PASSWORD,
	},
	secure: process.env.NODE_ENV === "production",
});

async function send(mailOptions: MailOptions) {
	await transporter.sendMail(mailOptions);
}

type MailOptions = {
	from: string;
	to: string;
	subject: string;
	text: string;
	html?: string;
};

const email = {
	send,
};

export default email;

import email from "infra/email";
import { UserRecord } from "models/user/types";

async function sendEmailToUser(user: UserRecord) {
	await email.send({
		from: "Chama News <contato@chama.dev.br>",
		to: `${user.email}`,
		subject: "Ative seu cadastro no Chama News",
		text: `${user.username}, clique no link abaixo para ativar seu cadastro no Chama News.
        
Link aqui
        
Atenciosamente.
`,
	});
}

const activation = {
	sendEmailToUser,
};

export default activation;

import database from "/infra/database.ts";

async function status(request, response) {
	const result = await database.query("SELECT 1 + 1 as SUM;");
	console.log(result.rows);
	response
		.status(200)
		.json({ message: "alunos do curso.dev são acima da média!" });
}

export default status;

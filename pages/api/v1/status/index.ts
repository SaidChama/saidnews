function status(request, response) {
	response
		.status(200)
		.json({ message: "alunos do curso.dev são acima da média!" });
}

export default status;

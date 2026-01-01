import useSWR from "swr";
import React from "react";

async function fetchApi(key) {
	const response = await fetch(key);
	const responseBody = await response.json();
	return responseBody;
}

export default function StatusPage() {
	return (
		<>
			<h1>Status</h1>
			<UpdatedAt />
			<DatabaseStatus />
		</>
	);
}

function UpdatedAt() {
	const { isLoading, data } = useSWR("/api/v1/status", fetchApi, {
		refreshInterval: 2000,
	});

	let updatedAtText = "carregando...";

	if (!isLoading && data) {
		updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
	}

	return <div>Última Atualização: {updatedAtText}</div>;
}

function DatabaseStatus() {
	const { isLoading, data } = useSWR("/api/v1/status", fetchApi);

	let databaseStatusInformation: React.ReactNode = "Carregando...";

	if (!isLoading && data) {
		databaseStatusInformation = (
			<>
				<div>Versão: {data.dependencies.database.version}</div>
				<div>
					Conexões Máximas:{" "}
					{data.dependencies.database.max_connections}
				</div>
				<div>
					Conexões Abertas:{" "}
					{data.dependencies.database.opened_connections}
				</div>
			</>
		);
	}

	return (
		<>
			<h2>Status do Banco de Dados</h2>
			<div>{databaseStatusInformation}</div>
		</>
	);
}

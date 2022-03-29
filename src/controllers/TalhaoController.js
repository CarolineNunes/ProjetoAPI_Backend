const { Talhao, Propriedade } = require("../models");
const {getToken} = require("../middlewares");

class TalhaoController {
	async create(req, res) {
		const {idusuario} = await getToken(req);
		let { idpropriedade, nome, geom } = req.body;
		idpropriedade = (idpropriedade || "").toString().replace(/[^\d]+/g, "");
		nome = (nome || "").toString().trim();
		geom = (geom || "").toString().trim();
		if( idpropriedade === "" ){
			return res.status(400).json({ error: "Forneça a identificação da propriedade" });
		}

		//verifica se o talhão pertence a uma propriedade do usuário
		return await Propriedade.findOne({ where: { idpropriedade, idusuario } })
			.then( async propriedade => {
				if( propriedade ){
					return await Talhao.create({idpropriedade,nome,geom})
						.then( talhao => {
							const { idpropriedade, nome, geom } = talhao.get();
							return res.json({ idpropriedade, nome, geom });
						})
						.catch((err) => {
							if( err.errors.length > 0 ){
								return res.status(400).json({ error: err.errors[0].message });
							}
							else{
								return res.status(400).json({ error: err.message });
							}
					  });
				}
				else
					return res.status(400).json({ error: "A propriedade não foi identificada" });
			})
			.catch((err) => {
				return res.status(400).json({ error: err.message });
		  });
	}

	async update(req, res) {
		const {idusuario} = await getToken(req);
		let { idtalhao, idpropriedade, nome, geom } = req.body;
		idtalhao = (idtalhao || "").toString().replace(/[^\d]+/g, "");
		idpropriedade = (idpropriedade || "").toString().replace(/[^\d]+/g, "");
		nome = (nome || "").toString().trim();
		geom = (geom || "").toString().trim();
		if( idtalhao === "" ){
			return res.status(400).json({ error: "Forneça a identificação do talhão" });
		}
		if( idpropriedade === "" ){
			return res.status(400).json({ error: "Forneça a identificação da propriedade" });
		}

		//verifica se o talhão pertence a uma propriedade do usuário
		return await Talhao.findOne({
			where: { idtalhao },
			include: [
				{
					model: Propriedade,
					where: {idusuario}
				}
			]
		 })
			.then( async talhao => {
				if( talhao ){
					//verifica se a nova propriedade pertence ao usuário
					const propriedade = await Propriedade.findOne({ where: { idpropriedade, idusuario } });
					if( propriedade ){
						await talhao.update({ idpropriedade, nome, geom });
						return res.json({idtalhao, idpropriedade, nome, geom});
					}
					else
						return res.status(400).json({ error: "A propriedade não foi identificada" });
				}
				else
					return res.status(400).json({ error: "O talhão não foi identificado" });
			})
			.catch((err) => {
				return res.status(400).json({ error: err.message });
		  });
	}

	async remove(req, res) {
		const { idusuario } = await getToken(req);
		let { idtalhao } = req.body;
		idtalhao = (idtalhao || "").toString().replace(/[^\d]+/g, "");
		if( idtalhao === "" ){
			return res.status(400).json({ error: "Forneça a identificação do talhão" });
		}

		return await Talhao.findOne({
			where: { idtalhao },
			include: [
				{
					model: Propriedade,
					where: {idusuario}
				}
			]
		})
			.then(async (talhao) => {
				if (talhao !== null) {
					await talhao.destroy();
					return res.json({ idtalhao, nome:talhao.nome });
				} else {
					return res.status(400).json({ error: "Talhão não identificado" });
				}
			})
			.catch((err) => {
				if( err.errors.length > 0 ){
					return res.status(400).json({ error: err.errors[0].message });
				}
				else{
					return res.status(400).json({ error: err.message });
				}
			  });
	}

	async list(req, res) {
		const {idusuario} = await getToken(req);
		let { idpropriedade, limit, offset } = req.body;
		idpropriedade = (idpropriedade || "").toString().replace(/[^\d]+/g, "");
		if( idpropriedade === "" ){
			return res.status(400).json({ error: "Forneça a identificação da propriedade" });
		}

		return await Talhao.findAndCountAll({
			where: { idpropriedade },
			attributes: ["idpropriedade", "idtalhao", "nome", "geom"],
			order: [["nome", "ASC"]],
			offset,
			limit,
			include: [
				{
					model: Propriedade,
					where: {idusuario},
					attributes: []
				}
			]
		})
			.then((talhoes) => {
				return res.json({
					talhoes: talhoes.rows.map((item) => item.get()),
					count: talhoes.count,
				});
			})
			.catch((e) => {
				return res.status(400).json({ error: e.message });
			});
	}
}

module.exports = TalhaoController;

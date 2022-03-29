const { Propriedade } = require("../models");
const {getToken} = require("../middlewares");

class PropriedadeController {
	async create(req, res) {
		const {idusuario} = await getToken(req);
		let { nome } = req.body;
		nome = (nome || "").toString().trim();

		return await Propriedade.create({idusuario,nome})
			.then(async (propriedade) => {
				const { idpropriedade, nome } = propriedade.get();
				return res.json({ idpropriedade, nome });
			})
			.catch((err) => {
				// pega os erros de validação emitidos pelo modelo do Sequelize
				if( err.errors.length > 0 ){
					return res.status(400).json({ error: err.errors[0].message });
				}
				else{
					return res.status(400).json({ error: err.message });
				}
			  });
	}

	async update(req, res) {
		// obtém o idusuario que está no token
		const {idusuario} =  await getToken(req);
		let { idpropriedade, nome } = req.body;
		nome = (nome || "").toString().trim();
		idpropriedade = (idpropriedade || "").toString().replace(/[^\d]+/g, "");
		if( idpropriedade === "" ){
			return res.status(400).json({ error: "Forneça a identificação da propriedade" });
		}

		return await Propriedade.findOne({ where: { idpropriedade, idusuario } })
			.then(async (propriedade) => {
				if (propriedade) {
					await propriedade.update({ nome });
					return res.json({idpropriedade, nome:propriedade.nome});
				}
				return res.status(400).json({ error: "Propriedade não identificada" });
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

	async remove(req, res) {
		const { idusuario } = await getToken(req);
		let { idpropriedade } = req.body;
		idpropriedade = (idpropriedade || "").toString().replace(/[^\d]+/g, "");
		if( idpropriedade === "" ){
			return res.status(400).json({ error: "Forneça a identificação da propriedade" });
		}

		return await Propriedade.findOne({ where: { idpropriedade, idusuario } })
			.then(async (propriedade) => {
				if (propriedade !== null) {
					await propriedade.destroy();
					return res.json({ idpropriedade, nome:propriedade.nome });
				} else {
					return res.status(400).json({ error: "Propriedade não identificada" });
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
		let { limit, offset } = req.body;
		return await Propriedade.findAndCountAll({
			where: { idusuario },
			attributes: ["idpropriedade", "nome"],
			order: [["nome", "ASC"]],
			offset,
			limit,
		})
			.then((propriedades) => {
				return res.json({
					propriedades: propriedades.rows.map((item) => item.get()),
					count: propriedades.count,
				});
			})
			.catch((e) => {
				return res.status(400).json({ error: e.message });
			});
	}
}

module.exports = PropriedadeController;

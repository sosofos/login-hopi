
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const app = express();
const port = 3000;

// Configuração do banco de dados
const db = mysql.createConnection({
    host: "localhost",
    user: "root", // Usuário padrão do XAMPP
    password: "root", // Deixe vazio se não configurou senha
    database: "hopihari_db",
    port: 3307,
});

// Conectar ao banco de dados
db.connect(err => {
    if (err) {
        console.error("Erro ao conectar ao MySQL:", err);
    } else {
        console.log("Conectado ao MySQL");
    }
});

// Configuração do Express
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
    secret: "segredo_super_secreto",
    resave: false,
    saveUninitialized: true
}));

// Página inicial (formulário de login)
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
});

// Rota para cadastro de usuários
app.post("/register", (req, res) => {
    const { name, email, password } = req.body;

    // Criptografar senha
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return res.send("Erro ao criptografar senha.");
        }

        const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        db.query(sql, [name, email, hash], (err, result) => {
            if (err) {
                return res.send("Erro ao cadastrar usuário.");
            }
            res.send("Cadastro realizado com sucesso! <a href='/'>Voltar ao login</a>");
        });
    });
});

// Rota para login
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err || results.length === 0) {
            return res.send("Usuário não encontrado.");
        }

        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (isMatch) {
                req.session.user = user;
                res.send(`Bem-vindo, ${user.name}! <a href='/logout'>Sair</a>`);
            } else {
                res.send("Senha incorreta.");
            }
        });
    });
});

// Rota para logout
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.send("Você saiu. <a href='/'>Login</a>");
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});


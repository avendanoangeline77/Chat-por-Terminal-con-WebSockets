import WebSocket from "ws";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import chalk from "chalk";


const rl = readline.createInterface({ input, output });


async function startChat() {
    console.log(chalk.cyan("Bienvenido al chat."));
    const username = await rl.question(chalk.cyan("Por favor, ingresa tu nombre de usuario: "));
    const client = new WebSocket("ws://localhost:8080");


    client.on("open", () => {
        client.send(username);
    });


    client.on("message", (message) => {
        const msg = message.toString();
        if (msg.includes("ha cerrado")) {
            console.log(chalk.red(msg));
        } else if (msg.startsWith("[Servidor]")) {
            console.log(chalk.blue(msg));
        } else {
            console.log(msg);
        }
    });


    client.on("close", (code, reason) => {
        if (code === 1001) {
            console.log(chalk.red("\n[Servidor]: La conexión finalizó porque el servidor se cerró."));
        }
        rl.close();
        process.exit(0);
    });


    client.on("error", (error) => {
        console.error(chalk.red("Error de conexión:"), error);
        process.exit(1);
    });


    async function readMessages() {
        while (true) {
            const message = await rl.question("");
           
            if (message.toLowerCase() === "/salir") {
                client.close();
                break;
            }
           
            if (message.toLowerCase() === "/ayuda") {
                console.log(chalk.cyan("Comandos disponibles:\n/salir - Salir del chat\n/ayuda - Mostrar ayuda"));
                continue;
            }
           
            client.send(message);
        }
    }
    readMessages();
}


startChat();


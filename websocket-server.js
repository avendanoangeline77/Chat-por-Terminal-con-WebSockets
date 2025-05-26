import { WebSocketServer } from "ws";
import chalk from "chalk";


    const wss = new WebSocketServer({ port: 8080 });
    const clients = new Map();


    console.log(chalk.green("Servidor de chat ejecutándose en ws://localhost:8080"));


    wss.on("connection", (socket) => {
        let username = "";


        socket.once("message", (nameMsg) => {
            username = nameMsg.toString();
            clients.set(username, socket);
        
            broadcast(chalk.blue(`[Servidor]: El usuario "${username}" se ha unido al chat.`), username);
            console.log(chalk.yellow(`Usuario conectado: ${username}`));
            socket.send(chalk.green(`Conectado al chat como "${username}".\n`));
        });


        socket.on("message", (message) => {
            const msg = message.toString();
            if (username && msg !== username) {
                console.log(chalk.cyan(`${username}: `) + msg);
                broadcast(`${username}: ${msg}`, username);
            }
        });


        socket.on("close", () => {
            if (username) {
                clients.delete(username);
                broadcast(chalk.blue(`[Servidor]: El usuario "${username}" ha salido del chat.`));
                console.log(chalk.yellow(`Usuario desconectado: ${username}`));
            }
        });


        socket.on("error", (error) => {
            console.error(chalk.red(`Error con ${username || 'cliente'}:`), error);
        });
    });


    function broadcast(message, excludeUser = "") {
        clients.forEach((client, username) => {
            if (username !== excludeUser && client.readyState === client.OPEN) {
                client.send(message);
            }
        });
    }


    let shutdownScheduled = false;


    function scheduleShutdown() {
        if (shutdownScheduled) return;
        shutdownScheduled = true;


        // Enviar aviso único a todos los clientes
        broadcast(chalk.red("[Servidor]: El chat se cerrará en 10 minutos.\n"));
        console.log(chalk.red("Notificando cierre en 10 minutoss"));


        // Programar cierre exacto después de 10 minutos
        const shutdownTimer = setTimeout(() => {
            // Mensaje final
            broadcast(chalk.red("[Servidor]: El servidor se esta cerrado. Nos vemos\n"));
            broadcast(chalk.yellow("Desconectado del servidor.\n"));
            console.log(chalk.red("Cerrando servidor..."));


            // Desconexión ordenada
            clients.forEach(client => {
                if (client.readyState === client.OPEN) {
                    client.close(1001, "Server shutdown");
                }
            });


            // Cierre del servidor
            wss.close(() => {
                console.log(" Servidor cerrado correctamente");
                process.exit(0);
            });
        }, 600000); // 10 minutos exactos (600,000 ms)
    }


    // Programar el aviso para enviarse 1 minuto dps de iniciar
    setTimeout(scheduleShutdown, 60000);



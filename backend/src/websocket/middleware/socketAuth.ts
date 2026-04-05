import { Socket } from "socket.io";
import { verifyToken, extractTokenFromQuery } from "../../utils/jwt";
import { logger } from "../../utils/logger";
import { AuthenticationError } from "../../utils/errors";

export function socketAuthMiddleware(socket: Socket, next: any): void {
  try {
    const token = extractTokenFromQuery(socket.handshake.query.token as string);
    const decoded = verifyToken(token);

    // Attach user data to socket
    (socket as any).user = decoded;
    socket.data.userId = decoded.user_id;
    socket.data.username = decoded.username;

    logger.info(`✅ WebSocket authenticated: ${socket.id} (user: ${decoded.username})`);
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      logger.error(`❌ WebSocket auth failed: ${error.message}`);
      next(new Error("Authentication failed"));
      return;
    }
    logger.error(`❌ WebSocket auth error: ${error}`);
    next(new Error("Authentication error"));
  }
}

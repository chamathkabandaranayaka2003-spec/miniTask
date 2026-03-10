import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

/**
 * Very small embedded HTTP server to accept updates from the frontend.
 *
 * Usage: java -cp . SyncServer
 */
public final class SyncServer {

    private final CategoryController controller = new CategoryController();

    public static void main(String[] args) throws Exception {
        new SyncServer().start(8080);
    }

    public void start(int port) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/updateCategory", new UpdateCategoryHandler());
        server.createContext("/categories", new CategoriesHandler());
        server.setExecutor(null);
        server.start();
        System.out.println("SyncServer running on http://localhost:" + port);
    }

    private class UpdateCategoryHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                respond(exchange, 405, "{\"error\": \"Method not allowed\"}");
                return;
            }

            String body = readBody(exchange.getRequestBody());
            // Expect payload { "categoryId": "needs", "total": 123 }
            String categoryId = JsonUtils.getString(body, "categoryId");
            Double total = JsonUtils.getDouble(body, "total");

            if (categoryId == null || total == null) {
                respond(exchange, 400, "{\"error\": \"Missing categoryId or total\"}");
                return;
            }

            controller.updateCategoryTotal(categoryId, total);
            respond(exchange, 200, "{\"status\": \"ok\"}");
        }
    }

    private class CategoriesHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                respond(exchange, 405, "{\"error\": \"Method not allowed\"}");
                return;
            }

            StringBuilder json = new StringBuilder("{");
            controller.getCategories().forEach((id, category) -> {
                json.append(quote(id)).append(":{")
                    .append("\"id\":").append(quote(category.getId())).append(",")
                    .append("\"label\":").append(quote(category.getLabel())).append(",")
                    .append("\"total\":").append(category.getTotal())
                    .append("},");
            });
            if (json.charAt(json.length() - 1) == ',') {
                json.setLength(json.length() - 1);
            }
            json.append("}");

            respond(exchange, 200, json.toString());
        }
    }

    private static void respond(HttpExchange exchange, int statusCode, String body) throws IOException {
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=utf-8");
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static String readBody(InputStream in) throws IOException {
        return new String(in.readAllBytes(), StandardCharsets.UTF_8);
    }

    private static String quote(String value) {
        return "\"" + value.replace("\"", "\\\"") + "\"";
    }
}

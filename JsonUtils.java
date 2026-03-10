import java.util.HashMap;
import java.util.Map;

/**
 * Tiny JSON helper to pull string/double values from a very small JSON payload.
 * Note: This is intentionally minimal and not a full JSON parser.
 */
public final class JsonUtils {

    public static String getString(String json, String key) {
        Map<String, String> map = parse(json);
        return map.get(key);
    }

    public static Double getDouble(String json, String key) {
        Map<String, String> map = parse(json);
        if (!map.containsKey(key)) return null;
        try {
            return Double.parseDouble(map.get(key));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static Map<String, String> parse(String json) {
        Map<String, String> result = new HashMap<>();
        if (json == null || json.isEmpty()) return result;

        String trimmed = json.trim();
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            trimmed = trimmed.substring(1, trimmed.length() - 1);
        }

        String[] parts = trimmed.split(",");
        for (String part : parts) {
            String[] kv = part.split(":", 2);
            if (kv.length != 2) continue;
            String key = kv[0].trim().replaceAll("^\"|\"$", "");
            String value = kv[1].trim().replaceAll("^\"|\"$", "");
            result.put(key, value);
        }
        return result;
    }
}

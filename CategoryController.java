/**
 * Simple controller to store and update categories in-memory.
 *
 * In a real app, this would proxy to a database layer.
 */
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

public final class CategoryController {

    private final Map<String, ExpenseCategory> categories = new LinkedHashMap<>();

    public CategoryController() {
        // Seed with defaults.
        categories.put("needs", new ExpenseCategory("needs", "Needs", 0, new double[0]));
        categories.put("wants", new ExpenseCategory("wants", "Wants", 0, new double[0]));
        categories.put("savings", new ExpenseCategory("savings", "Savings", 0, new double[0]));
    }

    public synchronized Map<String, ExpenseCategory> getCategories() {
        return Collections.unmodifiableMap(categories);
    }

    public synchronized ExpenseCategory getCategory(String id) {
        return categories.get(id);
    }

    public synchronized void updateCategoryTotal(String id, double total) {
        ExpenseCategory existing = categories.get(id);
        if (existing != null) {
            existing.setTotal(total);
        }
    }

    public synchronized void updateCategoryLabel(String id, String label) {
        ExpenseCategory existing = categories.get(id);
        if (existing != null && label != null && !label.isBlank()) {
            existing.setLabel(label);
        }
    }
}

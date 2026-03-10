/**
 * Represents a spending category (e.g., "needs", "wants", "savings") and its daily expenses.
 * The {@code id} is used as a stable identifier when labels change.
 */
public final class ExpenseCategory {

    private final String id;
    private String label;
    private double total;
    private final double[] dailyExpenses;

    public ExpenseCategory(String id, String label, double total, double[] dailyExpenses) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("Category id must be provided");
        }
        this.id = id;
        this.label = label == null ? id : label;
        this.total = total;
        this.dailyExpenses = dailyExpenses == null ? new double[0] : dailyExpenses.clone();
    }

    public String getId() {
        return id;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label == null ? this.label : label;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    public double[] getDailyExpenses() {
        return dailyExpenses.clone();
    }
}

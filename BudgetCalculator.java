/**
 * Very small backend helper to compute remaining balance and format daily spending.
 * This class is intentionally minimal so it can be used in both console demos and a
 * lightweight backend service for the dashboard.
 */
public final class BudgetCalculator {

    private BudgetCalculator() {
        // Utility class
    }

    /**
     * Calculate the remaining balance for a given allowance and a series of daily expenses.
     *
     * @param allowance The monthly allowance in dollars (e.g., 2000.0).
     * @param dailyExpenses An array of daily spending values.
     * @return Remaining balance (never negative).
     */
    public static double calculateRemainingBalance(double allowance, double[] dailyExpenses) {
        if (allowance <= 0 || dailyExpenses == null) {
            return 0;
        }
        double spent = 0;
        for (double expense : dailyExpenses) {
            spent += expense;
        }
        double remaining = allowance - spent;
        return remaining < 0 ? 0 : remaining;
    }

    /**
     * Sum daily expenses into a single monthly total.
     *
     * @param dailyExpenses The daily expense values.
     * @return The total spending for the month.
     */
    public static double calculateMonthlyTotal(double[] dailyExpenses) {
        if (dailyExpenses == null) {
            return 0;
        }
        double total = 0;
        for (double expense : dailyExpenses) {
            total += expense;
        }
        return total;
    }

    /**
     * Calculate totals for multiple categories identified by stable IDs.
     * This allows labels to change without affecting the math.
     */
    public static java.util.Map<String, Double> calculateTotalsByCategory(java.util.List<ExpenseCategory> categories) {
        java.util.Map<String, Double> totals = new java.util.LinkedHashMap<>();
        if (categories == null) {
            return totals;
        }
        for (ExpenseCategory category : categories) {
            totals.put(category.getId(), calculateMonthlyTotal(category.getDailyExpenses()));
        }
        return totals;
    }

    public static double calculateRemainingBalance(double allowance, java.util.List<ExpenseCategory> categories) {
        if (allowance <= 0) {
            return 0;
        }
        double spent = 0;
        for (double amount : calculateTotalsByCategory(categories).values()) {
            spent += amount;
        }
        double remaining = allowance - spent;
        return remaining < 0 ? 0 : remaining;
    }

    /**
     * Convert a daily expense array into a cumulative running total.
     * This is useful to plot how spending accumulates over a month.
     *
     * @param dailyExpenses The raw daily expense values.
     * @return An array where each index is the sum of all expenses up to that day.
     */
    public static double[] cumulativeExpenses(double[] dailyExpenses) {
        if (dailyExpenses == null) {
            return new double[0];
        }
        double[] cumul = new double[dailyExpenses.length];
        double running = 0;
        for (int i = 0; i < dailyExpenses.length; i++) {
            running += dailyExpenses[i];
            cumul[i] = running;
        }
        return cumul;
    }

    /**
     * Format an array of daily expenses into a string array with two-decimal precision.
     *
     * @param dailyExpenses The raw expense values.
     * @return A string array where each value is formatted as a dollar string (e.g., "$123.45").
     */
    public static String[] formatDailyExpenses(double[] dailyExpenses) {
        if (dailyExpenses == null) {
            return new String[0];
        }
        String[] formatted = new String[dailyExpenses.length];
        for (int i = 0; i < dailyExpenses.length; i++) {
            formatted[i] = String.format("$%.2f", dailyExpenses[i]);
        }
        return formatted;
    }

    /**
     * Quick demo when running from the command line.
     */
    public static void main(String[] args) {
        double allowance = 2000;
        double[] needs = { 180, 150, 210, 175, 220, 190, 205 };
        double[] wants = { 70, 55, 90, 65, 85, 60, 88 };
        double[] savings = { 90, 88, 92, 85, 95, 82, 90 };

        java.util.List<ExpenseCategory> categories = java.util.List.of(
            new ExpenseCategory("needs", "Needs", needs),
            new ExpenseCategory("wants", "Wants", wants),
            new ExpenseCategory("savings", "Savings", savings)
        );

        System.out.println("Monthly allowance: " + allowance);
        System.out.println("Category totals (by id):");
        calculateTotalsByCategory(categories).forEach((id, total) ->
            System.out.printf("  %s: $%.2f%n", id, total)
        );

        System.out.println("Remaining: " + calculateRemainingBalance(allowance, categories));

        System.out.println("Formatted daily spend for 'needs':");
        for (String value : formatDailyExpenses(needs)) {
            System.out.println("  " + value);
        }
    }
}

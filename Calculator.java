import java.util.Scanner;

public class Calculator {

    // --- Basic operations ---

    static double add(double a, double b)      { return a + b; }
    static double subtract(double a, double b) { return a - b; }
    static double multiply(double a, double b) { return a * b; }

    static double divide(double a, double b) {
        if (b == 0) throw new ArithmeticException("Division by zero is not allowed.");
        return a / b;
    }

    static double modulo(double a, double b) {
        if (b == 0) throw new ArithmeticException("Modulo by zero is not allowed.");
        return a % b;
    }

    static double power(double base, double exp) { return Math.pow(base, exp); }

    static double sqrt(double a) {
        if (a < 0) throw new ArithmeticException("Cannot take square root of a negative number.");
        return Math.sqrt(a);
    }

    // --- Display helpers ---

    static void printMenu() {
        System.out.println("\n+--------------------------------+");
        System.out.println("|        JAVA CALCULATOR         |");
        System.out.println("+--------------------------------+");
        System.out.println("|  1. Addition       ( a + b )  |");
        System.out.println("|  2. Subtraction    ( a - b )  |");
        System.out.println("|  3. Multiplication ( a * b )  |");
        System.out.println("|  4. Division       ( a / b )  |");
        System.out.println("|  5. Modulo         ( a % b )  |");
        System.out.println("|  6. Power          ( a ^ b )  |");
        System.out.println("|  7. Square Root    ( sqrt(a)) |");
        System.out.println("|  0. Exit                       |");
        System.out.println("+--------------------------------+");
        System.out.print("Choose an option: ");
    }

    // Print as integer when there is no fractional part
    static String fmt(double v) {
        if (v == Math.floor(v) && !Double.isInfinite(v)) {
            return String.valueOf((long) v);
        }
        return String.valueOf(v);
    }

    // --- Entry point ---

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.println("Welcome to the Java Calculator!");

        while (true) {
            printMenu();

            int choice;
            try {
                choice = Integer.parseInt(scanner.nextLine().trim());
            } catch (NumberFormatException e) {
                System.out.println("Invalid input. Please enter a number from the menu.");
                continue;
            }

            if (choice == 0) {
                System.out.println("Goodbye!");
                break;
            }

            if (choice < 1 || choice > 7) {
                System.out.println("Invalid option. Please choose between 0 and 7.");
                continue;
            }

            try {
                double a, b, result;

                if (choice == 7) {
                    System.out.print("Enter a number: ");
                    a = Double.parseDouble(scanner.nextLine().trim());
                    result = sqrt(a);
                    System.out.printf("sqrt(%s) = %s%n", fmt(a), fmt(result));
                } else {
                    System.out.print("Enter first number  (a): ");
                    a = Double.parseDouble(scanner.nextLine().trim());
                    System.out.print("Enter second number (b): ");
                    b = Double.parseDouble(scanner.nextLine().trim());

                    switch (choice) {
                        case 1:
                            result = add(a, b);
                            System.out.printf("%s + %s = %s%n", fmt(a), fmt(b), fmt(result));
                            break;
                        case 2:
                            result = subtract(a, b);
                            System.out.printf("%s - %s = %s%n", fmt(a), fmt(b), fmt(result));
                            break;
                        case 3:
                            result = multiply(a, b);
                            System.out.printf("%s * %s = %s%n", fmt(a), fmt(b), fmt(result));
                            break;
                        case 4:
                            result = divide(a, b);
                            System.out.printf("%s / %s = %s%n", fmt(a), fmt(b), fmt(result));
                            break;
                        case 5:
                            result = modulo(a, b);
                            System.out.printf("%s %% %s = %s%n", fmt(a), fmt(b), fmt(result));
                            break;
                        case 6:
                            result = power(a, b);
                            System.out.printf("%s ^ %s = %s%n", fmt(a), fmt(b), fmt(result));
                            break;
                        default:
                            System.out.println("Unexpected error.");
                    }
                }
            } catch (NumberFormatException e) {
                System.out.println("Invalid number entered. Please try again.");
            } catch (ArithmeticException e) {
                System.out.println("Math error: " + e.getMessage());
            }
        }

        scanner.close();
    }
}

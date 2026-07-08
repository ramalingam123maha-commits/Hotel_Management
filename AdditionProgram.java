import java.util.Scanner;

public class AdditionProgram {
    
    // Method to add two numbers
    public static int add(int a, int b) {
        return a + b;
    }
    
    // Method to add two double numbers
    public static double add(double a, double b) {
        return a + b;
    }
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        System.out.println("=== Java Addition Program ===");
        System.out.println("Choose an option:");
        System.out.println("1. Add two integers");
        System.out.println("2. Add two decimal numbers");
        System.out.print("Enter your choice (1 or 2): ");
        
        int choice = scanner.nextInt();
        
        if (choice == 1) {
            System.out.print("Enter first integer: ");
            int num1 = scanner.nextInt();
            System.out.print("Enter second integer: ");
            int num2 = scanner.nextInt();
            
            int result = add(num1, num2);
            System.out.println("\nResult: " + num1 + " + " + num2 + " = " + result);
            
        } else if (choice == 2) {
            System.out.print("Enter first decimal number: ");
            double num1 = scanner.nextDouble();
            System.out.print("Enter second decimal number: ");
            double num2 = scanner.nextDouble();
            
            double result = add(num1, num2);
            System.out.println("\nResult: " + num1 + " + " + num2 + " = " + result);
            
        } else {
            System.out.println("Invalid choice. Please run the program again.");
        }
        
        scanner.close();
    }
}

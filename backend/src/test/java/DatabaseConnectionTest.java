

import java.sql.Connection;
import java.sql.SQLException;

import com.subsentry.util.DatabaseConnection;

public class DatabaseConnectionTest {
    public static void main(String[] args) {
        try {
            Connection conn = DatabaseConnection.getConnection();
            if (conn != null && !conn.isClosed()) {
                System.out.println(" Database connection successful!");
                
                // Test simple query
                var stmt = conn.createStatement();
                var rs = stmt.executeQuery("SELECT 1");
                if (rs.next()) {
                    System.out.println(" Database query successful!");
                }
                
                DatabaseConnection.closeConnection();
            }
        } catch (SQLException e) {
            System.out.println(" Database connection failed!");
            e.printStackTrace();
        }
    }
}
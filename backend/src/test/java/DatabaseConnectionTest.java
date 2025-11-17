

package com.subsentry;

import com.subsentry.util.DatabaseConnection;
import org.junit.jupiter.api.Test;

import java.sql.Connection;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class DatabaseConnectionTest {

    @Test
    void connectionShouldOpenAndClose() throws Exception {
        Connection conn = DatabaseConnection.getConnection();
        assertNotNull(conn);
        assertFalse(conn.isClosed());
    }
}
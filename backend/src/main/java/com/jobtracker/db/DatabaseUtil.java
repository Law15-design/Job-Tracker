package com.jobtracker.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class DatabaseUtil {

    private static final String ENV_VAR_NAME = "DATABASE_URL";

    static {
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("Postgres JDBC driver not found", e);
        }
        initializeSchema();
    }

    private static String getConnectionUrl() {
        String url = System.getenv(ENV_VAR_NAME);
        if (url == null || url.isBlank()) {
            throw new RuntimeException(
                "Missing " + ENV_VAR_NAME + " environment variable. " +
                "Set it in setenv.bat before starting Tomcat."
            );
        }
        return url;
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(getConnectionUrl());
    }

    private static void initializeSchema() {
        String createTable =
            "CREATE TABLE IF NOT EXISTS job_applications (" +
            "  id SERIAL PRIMARY KEY," +
            "  job_title TEXT NOT NULL," +
            "  company TEXT NOT NULL," +
            "  job_id TEXT," +
            "  applied_date DATE NOT NULL," +
            "  status TEXT NOT NULL DEFAULT 'Applied'," +
            "  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
            ")";
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute(createTable);
        } catch (SQLException e) {
            throw new RuntimeException("Failed to initialize database schema", e);
        }
    }
}
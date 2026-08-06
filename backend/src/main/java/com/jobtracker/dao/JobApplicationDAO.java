package com.jobtracker.dao;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import com.jobtracker.db.DatabaseUtil;
import com.jobtracker.model.JobApplication;

public class JobApplicationDAO {

    public int insert(JobApplication job) throws SQLException {
        String sql = "INSERT INTO job_applications (job_title, company, job_id, applied_date, status) " +
                     "VALUES (?, ?, ?, ?, ?) RETURNING id";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, job.jobTitle);
            ps.setString(2, job.company);
            ps.setString(3, job.jobId);
            ps.setDate(4, Date.valueOf(job.appliedDate));
            ps.setString(5, job.status == null ? "Applied" : job.status);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getInt("id");
            }
        }
        return -1;
    }

    public List<JobApplication> search(String query) throws SQLException {
        String sql = "SELECT * FROM job_applications " +
                     "WHERE LOWER(job_title) LIKE ? OR LOWER(company) LIKE ? OR LOWER(job_id) LIKE ? " +
                     "ORDER BY created_at DESC";
        List<JobApplication> results = new ArrayList<>();
        String like = "%" + query.toLowerCase() + "%";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, like);
            ps.setString(2, like);
            ps.setString(3, like);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) results.add(mapRow(rs));
            }
        }
        return results;
    }

    public List<JobApplication> getAll() throws SQLException {
        String sql = "SELECT * FROM job_applications ORDER BY created_at DESC";
        List<JobApplication> results = new ArrayList<>();
        try (Connection conn = DatabaseUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) results.add(mapRow(rs));
        }
        return results;
    }

    public boolean updateStatus(int id, String status) throws SQLException {
        String sql = "UPDATE job_applications SET status = ? WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status);
            ps.setInt(2, id);
            return ps.executeUpdate() > 0;
        }
    }

    public boolean delete(int id) throws SQLException {
        String sql = "DELETE FROM job_applications WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }

    private JobApplication mapRow(ResultSet rs) throws SQLException {
        JobApplication job = new JobApplication();
        job.id = rs.getInt("id");
        job.jobTitle = rs.getString("job_title");
        job.company = rs.getString("company");
        job.jobId = rs.getString("job_id");
        job.appliedDate = rs.getDate("applied_date").toString();
        job.status = rs.getString("status");
        return job;
    }
    
      // get how much space our database using right now, in bytes
    // postgres has this built in function, no extra setup needed
    public long getDatabaseSizeBytes() throws SQLException {
        String sql = "SELECT pg_database_size(current_database())";
        try (Connection conn = DatabaseUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getLong(1);
        }
        return 0;
    }
}
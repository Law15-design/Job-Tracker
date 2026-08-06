package com.jobtracker.servlet;

import com.jobtracker.dao.JobApplicationDAO;
import org.json.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;

@WebServlet("/api/jobs/dbsize")
public class DbSizeServlet extends HttpServlet {

    // neon free tier limit is 0.5 GB, hardcoding it here since it dont change
    private static final long FREE_TIER_LIMIT_BYTES = 500L * 1024 * 1024;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        resp.setContentType("application/json");

        try {
            long usedBytes = new JobApplicationDAO().getDatabaseSizeBytes();
            double usedMb = usedBytes / (1024.0 * 1024.0);
            double limitMb = FREE_TIER_LIMIT_BYTES / (1024.0 * 1024.0);
            double percentUsed = (usedBytes * 100.0) / FREE_TIER_LIMIT_BYTES;

            JSONObject result = new JSONObject();
            result.put("usedMb", Math.round(usedMb * 100.0) / 100.0);
            result.put("limitMb", Math.round(limitMb));
            result.put("percentUsed", Math.round(percentUsed * 10.0) / 10.0);

            resp.getWriter().write(result.toString());
        } catch (SQLException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write(new JSONObject().put("error", e.getMessage()).toString());
        }
    }
}
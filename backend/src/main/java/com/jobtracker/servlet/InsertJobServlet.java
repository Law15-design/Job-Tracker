package com.jobtracker.servlet;

import com.jobtracker.dao.JobApplicationDAO;
import com.jobtracker.model.JobApplication;
import org.json.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.stream.Collectors;

@WebServlet("/api/jobs/insert")
public class InsertJobServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        resp.setContentType("application/json");

        String body = readBody(req);
        JSONObject input = new JSONObject(body);

        JobApplication job = new JobApplication();
        job.jobTitle = input.optString("jobTitle", "").trim();
        job.company = input.optString("company", "").trim();
        job.jobId = input.optString("jobId", "").trim();
        job.status = "Applied";

        boolean useToday = input.optBoolean("useToday", true);
        job.appliedDate = useToday
            ? LocalDate.now().toString()
            : input.optString("appliedDate", LocalDate.now().toString());

        if (job.jobTitle.isEmpty() || job.company.isEmpty()) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write(new JSONObject().put("error", "Job title and company are required").toString());
            return;
        }

        try {
            int id = new JobApplicationDAO().insert(job);
            job.id = id;
            resp.getWriter().write(job.toJson().toString());
        } catch (SQLException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write(new JSONObject().put("error", e.getMessage()).toString());
        }
    }

    private String readBody(HttpServletRequest req) throws IOException {
        try (BufferedReader reader = req.getReader()) {
            return reader.lines().collect(Collectors.joining());
        }
    }
}
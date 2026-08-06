package com.jobtracker.servlet;

import com.jobtracker.dao.JobApplicationDAO;
import org.json.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@WebServlet("/api/jobs/update")
public class UpdateStatusServlet extends HttpServlet {

    private static final List<String> VALID_STATUSES =
        Arrays.asList("Applied", "Interview", "Accepted", "Rejected");

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        resp.setContentType("application/json");

        String body = readBody(req);
        JSONObject input = new JSONObject(body);

        int id = input.optInt("id", -1);
        String status = input.optString("status", "");

        if (id == -1 || !VALID_STATUSES.contains(status)) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write(new JSONObject().put("error", "Valid id and status required").toString());
            return;
        }

        try {
            boolean updated = new JobApplicationDAO().updateStatus(id, status);
            resp.getWriter().write(new JSONObject().put("success", updated).toString());
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
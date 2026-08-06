package com.jobtracker.servlet;

import com.jobtracker.dao.JobApplicationDAO;
import com.jobtracker.model.JobApplication;
import org.json.JSONArray;
import org.json.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;
import java.util.List;

@WebServlet("/api/jobs/search")
public class SearchJobServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        resp.setContentType("application/json");

        String query = req.getParameter("query");
        if (query == null) query = "";

        try {
            List<JobApplication> results = new JobApplicationDAO().search(query);
            JSONArray arr = new JSONArray();
            for (JobApplication job : results) arr.put(job.toJson());
            resp.getWriter().write(arr.toString());
        } catch (SQLException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write(new JSONObject().put("error", e.getMessage()).toString());
        }
    }
}
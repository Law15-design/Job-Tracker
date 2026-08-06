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

@WebServlet("/api/jobs/delete")
public class DeleteJobServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        resp.setContentType("application/json");

        String idParam = req.getParameter("id");
        if (idParam == null) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write(new JSONObject().put("error", "id parameter required").toString());
            return;
        }

        try {
            int id = Integer.parseInt(idParam);
            boolean deleted = new JobApplicationDAO().delete(id);
            resp.getWriter().write(new JSONObject().put("success", deleted).toString());
        } catch (NumberFormatException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write(new JSONObject().put("error", "Invalid id").toString());
        } catch (SQLException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write(new JSONObject().put("error", e.getMessage()).toString());
        }
    }
}
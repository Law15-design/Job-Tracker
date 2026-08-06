package com.jobtracker.model;

import org.json.JSONObject;

public class JobApplication {
    public int id;
    public String jobTitle;
    public String company;
    public String jobId;       // optional, e.g. a posting ID like "R12345"
    public String appliedDate; // "YYYY-MM-DD"
    public String status;      // Applied, Interview, Accepted, Rejected

    public JSONObject toJson() {
        JSONObject o = new JSONObject();
        o.put("id", id);
        o.put("jobTitle", jobTitle);
        o.put("company", company);
        o.put("jobId", jobId == null ? "" : jobId);
        o.put("appliedDate", appliedDate);
        o.put("status", status);
        return o;
    }
}
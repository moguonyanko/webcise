package webcise;

import java.io.IOException;
import java.io.PrintWriter;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet(name = "SaveXML", urlPatterns = {"/SaveXML"})
public class SaveXML extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try (PrintWriter out = response.getWriter()) {
            JsonObjectBuilder builder = Json.createObjectBuilder();
            builder.add("result", "Request received but implemented now");
            builder.add("status", HttpServletResponse.SC_NOT_IMPLEMENTED);
            JsonObject json = builder.build();
            out.println(json.toString());
        }
    }

}

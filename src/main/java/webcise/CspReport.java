package webcise;

import java.io.IOException;
import java.io.PrintWriter;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet(name = "CspReport", urlPatterns = {"/CspReport"})
public class CspReport extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        // 違反報告JSONはそれほど大きいオブジェクトにならないはずなので
        // JsonObjectを使っている。もし大きくなりそうな時はJsonParserを
        // 使うべきかもしれない。
        try (JsonReader reader = Json.createReader(request.getInputStream())) {
            JsonObject jsonObject = reader.readObject();
            String allResult = jsonObject.toString();
            System.out.println(allResult);
            
            // リクエストボディの違反報告JSONをレスポンスとして返すことで
            // ブラウザのデバッガでも内容を確認できるようにする。しかしブラウザには
            // レスポンスが返ってこない。
            PrintWriter out = response.getWriter();
            out.print(allResult);
        }
    }
    
}

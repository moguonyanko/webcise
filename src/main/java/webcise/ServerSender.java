package webcise;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.servlet.AsyncContext;
import jakarta.servlet.AsyncEvent;
import jakarta.servlet.AsyncListener;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet(name = "ServerSender", urlPatterns = {"/ServerSender"},
        asyncSupported = true)
public class ServerSender extends HttpServlet {

    private final Set<AsyncContext> asyncContexts = new HashSet<>();

    private String getResultJSON(String message) {
        JsonObjectBuilder builder = Json.createObjectBuilder();
        JsonObjectBuilder jb = Json.createObjectBuilder();
        jb.add("message", message);
        builder.add("result", jb);
        JsonObject json = builder.build();
        return json.toString();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        if (!SSE.isSSERequest(req)) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        SSE.setSSEResponseAttributes(resp);

        //TODO: IllegalStateException at Tomcat8.5
        final AsyncContext asyncContext = req.startAsync();

        asyncContext.addListener(new AsyncListener() {
            @Override
            public void onComplete(AsyncEvent ae) throws IOException {
                System.out.println("SSE complete");
                asyncContexts.remove(ae.getAsyncContext());
            }

            @Override
            public void onTimeout(AsyncEvent ae) throws IOException {
                System.out.println("SSE timeout");
                asyncContexts.remove(ae.getAsyncContext());
            }

            @Override
            public void onError(AsyncEvent ae) throws IOException {
                System.out.println("SSE error");
                asyncContexts.remove(ae.getAsyncContext());
            }

            @Override
            public void onStartAsync(AsyncEvent ae) throws IOException {
                System.out.println("SSE start");
            }
        });

        asyncContexts.add(asyncContext);
        System.out.println("Added async context:" + asyncContext.toString());
    }

    private void writeResult(AsyncContext asyncContext, String message) {
        try (PrintWriter out = asyncContext.getResponse().getWriter()) {
            String result = getResultJSON(message + ":" + LocalDateTime.now().toString());
            out.print(result);
            boolean hadError = out.checkError();
            if (hadError) {
                throw new IllegalStateException("json writing error");
            }
        } catch (IOException ie) {
            throw new IllegalStateException(ie);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        if (asyncContexts.isEmpty()) {
            //resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            String noData = getResultJSON("no data");
            try (PrintWriter out = resp.getWriter()) {
                out.print(noData);
            }
            return;
        }

        String message = req.getParameter("message");
        asyncContexts.forEach(asyncContext -> writeResult(asyncContext, message));
    }

    @Override
    public void destroy() {
        System.out.println("SSE destroy");
        asyncContexts.forEach(AsyncContext::complete);
        super.destroy();
    }

}

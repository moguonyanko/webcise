package webcise;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Objects;
import java.util.stream.Stream;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet(name = "Calculator", urlPatterns = {"/Calculator"})
public class Calculator extends HttpServlet {

    private enum Operator {

        ADD {
            @Override
            int calc(int a, int b) {
                return a + b;
            }
        },
        SUB {
            @Override
            int calc(int a, int b) {
                return a - b;
            }
        },
        MUL {
            @Override
            int calc(int a, int b) {
                return a * b;
            }
        },
        DIV {
            @Override
            int calc(int a, int b) {
                return a / b;
            }
        },
        NONE {
            @Override
            int calc(int a, int b) {
                return a;
            }
        };

        abstract int calc(int a, int b);
    }

    private void sendResult(PrintWriter out, Integer result) {
        int status = Objects.nonNull(result)
                ? HttpServletResponse.SC_OK
                : HttpServletResponse.SC_INTERNAL_SERVER_ERROR;

        sendResult(out, result, status);
    }

    private void sendResult(PrintWriter out, Integer result, int status) {
        JsonObjectBuilder builder = Json.createObjectBuilder();
        builder.add("result", result);
        builder.add("status", status);
        JsonObject json = builder.build();
        out.println(json.toString());
    }

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        Integer result = null;

        PrintWriter out = response.getWriter();
        response.setContentType("text/html;charset=UTF-8");

        String[] params = request.getParameterValues("parameter");
        String opr = request.getParameter("operator");

        Operator operator;
        try {
            operator = Operator.valueOf(opr.toUpperCase());
        } catch (IllegalArgumentException ex) {
            /**
             * sendErrorしてもブラウザ側のonerrorハンドラは呼び出されない。
             * ブラウザ側のエラーハンドリングが行いにくくなるだけである。
             */
            //response.sendError(HttpServletResponse.SC_BAD_REQUEST);
            sendResult(out, result, HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        try {
            result = Stream.of(params)
                    .map(Integer::parseInt)
                    .reduce(operator::calc)
                    .orElse(null);
            sendResult(out, result);
        } catch (NumberFormatException ex) {
            sendResult(out, result, HttpServletResponse.SC_BAD_REQUEST);
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try (PrintWriter out = response.getWriter()) {
            JsonObjectBuilder builder = Json.createObjectBuilder();
            builder.add("result", "Not implemented");
            builder.add("status", 501);
            JsonObject json = builder.build();
            out.println(json.toString());
        }
    }

}

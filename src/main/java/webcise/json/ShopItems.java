package webcise.json;

import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;

import jakarta.json.Json;
import jakarta.json.stream.JsonGenerator;
import jakarta.json.stream.JsonGeneratorFactory;
import jakarta.json.stream.JsonParser;
import jakarta.json.stream.JsonParsingException;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet(name = "ShopItems", urlPatterns = {"/shopitems"})
public class ShopItems extends HttpServlet {

	private JsonParser.Event printResult(HttpServletResponse res,
		JsonParser parser, JsonParser.Event evt) throws IOException {
		JsonParser.Event event = evt;
		PrintWriter out = res.getWriter();
		JsonGeneratorFactory factory = Json.createGeneratorFactory(null);
		try (JsonGenerator generator = factory.createGenerator(out)) {
			generator.writeStartArray();
			while (parser.hasNext()) {
				event = parser.next();
				if (event.equals(JsonParser.Event.VALUE_STRING)) {
					String itemName = parser.getString();
					generator.write(itemName);
				} else if (event.equals(JsonParser.Event.END_ARRAY)) {
					break;
				}
			}
			generator.writeEnd();
		}

		return event;
	}

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse res)
		throws ServletException, IOException {
		res.setContentType("application/json");

		String path = "/WEB-INF/resources/sample1.json";

		try (InputStream in = req.getServletContext().getResourceAsStream(path);
			JsonParser parser = Json.createParser(in)) {

			boolean detected = false;

			try {
				while (parser.hasNext()) {
					JsonParser.Event event = parser.next();

					while (parser.hasNext() &&
						!(event.equals(JsonParser.Event.KEY_NAME) &&
						parser.getString().matches("name"))) {
						event = parser.next();
					}

					if (parser.hasNext()) {
						event = parser.next();
						String targetShopName = req.getParameter("shopname");

						if (event.equals(JsonParser.Event.VALUE_STRING) &&
							parser.getString().matches(targetShopName)) {
							while (parser.hasNext() &&
								!(event.equals(JsonParser.Event.KEY_NAME) &&
								parser.getString().matches("items"))) {
								event = parser.next();
							}

							if (event.equals(JsonParser.Event.KEY_NAME) &&
								parser.getString().matches("items")) {
								printResult(res, parser, event);
								detected = true;
								break;
							}
						}
					}
				}
			} catch (JsonParsingException exception) {
				exception.printStackTrace(System.err);
				/**
				 * 配列でレスポンスを返す場合エラー時に空の配列を返すのは好ましくない。
				 * というのも正常に処理が完了した結果空の配列が得られたのか，
				 * エラーによって空の配列が割り当てられたのかが区別できなくなる
				 * からである。正常時とエラー時で同じレスポンスを返すと，クライアントが
				 * エラーを検知することができず対応を行うことができない。
				 * 
				 * レスポンスにステータスコードやメッセージを含めて返せばそのような
				 * 状況は回避できるが，そうするのであれば配列ではなくオブジェクトで
				 * レスポンスを返すべきである。配列の何番目の要素がステータスコード
				 * である…といったことをクライアントに考えさせるのは非常に良くない。
				 */
				res.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
					exception.getMessage());
			}

			if (!detected && !res.isCommitted()) {
				PrintWriter out = res.getWriter();
				out.print(Jsons.getEmptyArray().toString());
			}
		}
	}

}

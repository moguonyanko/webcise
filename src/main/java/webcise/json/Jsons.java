package webcise.json;

import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonObject;

public class Jsons {
	
	public static JsonObject getEmptyJson() {
		return Json.createObjectBuilder().build();
	}
	
	public static JsonArray getEmptyArray() {
		return Json.createArrayBuilder().build();
	}
	
}

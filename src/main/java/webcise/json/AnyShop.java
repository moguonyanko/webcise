package webcise.json;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class AnyShop<T> {

    private final String name;
    private final List<T> items;

    public AnyShop(String name, List<T> items) {
        this.name = name;
        this.items = items;
    }

    public List<String> getItemNames() {
        return items.stream()
                .map(T::toString)
                .collect(Collectors.toList());
    }

    public static List<AnyShop<String>> getShops() {
        List<String> items1 = Arrays.asList("apple", "orange", "lemon");
        AnyShop<String> shop1 = new AnyShop<>("abc", items1);

        List<String> items2 = Arrays.asList("pencil", "eraser", "ruler");
        AnyShop<String> shop2 = new AnyShop<>("fuga", items2);

        return Arrays.asList(shop1, shop2);
    }

    public String getName() {
        return name;
    }
    
}

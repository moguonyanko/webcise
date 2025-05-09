class SimpleBackgroundPainter {
    // メソッド名はinputPropertiesでなければならない。
    // staticメソッドであることも必須である。
    static get inputProperties() {
        const properties =  [ 
            "--base-size" 
        ];
        return properties;
    }
    
    paint(context, geometry, properties) {
        //console.log(context, geometry, properties);
        const colors = ["turquoise", "darkcyan", "orange"];
        
        // 戻り値はCSSUnparsedValueなのでparseInt等で型変換する。
        const propBaseSize = properties.get("--base-size");
        //console.log(propBaseSize);
        const size = parseInt(propBaseSize);
        const yLim = geometry.height / size,
            xLim = geometry.width / size;
        
        context.globalAlpha = 0.5;
        for (let y = 0; y < yLim; y++) {
            for (let x = 0; x < xLim; x++) {
                const color = colors[(x + y) % colors.length];
                context.beginPath();
                context.fillStyle = color;
                context.rect(x * size, y * size, size, size);
                //context.arc(x * size, y * size, size, 0, 2 * Math.PI);
                context.fill();
            }
        }
        
        // consoleは定義されているがwindowは未定義。
        //window.setInterval(this.paint, 1000);
    }
}

registerPaint("simplebg", SimpleBackgroundPainter);

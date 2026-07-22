export default function executeFloodFill(ctx: CanvasRenderingContext2D, startX: number, startY: number, fillColorStr: string) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    
    // 1. Get raw pixel data from the canvas
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // 2. Convert the Hex color (e.g., "#FF0000") to RGB values
    const r = parseInt(fillColorStr.slice(1, 3), 16);
    const g = parseInt(fillColorStr.slice(3, 5), 16);
    const b = parseInt(fillColorStr.slice(5, 7), 16);

    // 3. Find the color of the exact pixel the user clicked
    const startPos = (Math.floor(startY) * width + Math.floor(startX)) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    const startA = data[startPos + 3];

    // SAFETY CATCH: If the pixel is already the target color, do nothing to prevent infinite loops!
    if (startR === r && startG === g && startB === b && startA === 255) return;

    function matchStartColor(pos: number) {
        return data[pos] === startR && data[pos+1] === startG && data[pos+2] === startB && data[pos+3] === startA;
    }

    function colorPixel(pos: number) {
        data[pos] = r; data[pos+1] = g; data[pos+2] = b; data[pos+3] = 255;
    }

    // 4. The Span-Fill Algorithm
    const pixelStack = [[Math.floor(startX), Math.floor(startY)]];

    while (pixelStack.length > 0) {
        const newPos = pixelStack.pop()!;
        let cx = newPos[0];
        let cy = newPos[1];
        let currentPos = (cy * width + cx) * 4;

        // Move up until we hit a border
        while (cy >= 0 && matchStartColor(currentPos)) {
            cy -= 1;
            currentPos -= width * 4;
        }

        currentPos += width * 4;
        cy += 1;

        let reachLeft = false;
        let reachRight = false;

        // Move down, coloring and checking left/right as we drop
        while (cy < height && matchStartColor(currentPos)) {
            colorPixel(currentPos);

            if (cx > 0) {
                if (matchStartColor(currentPos - 4)) {
                    if (!reachLeft) {
                        pixelStack.push([cx - 1, cy]);
                        reachLeft = true;
                    }
                } else if (reachLeft) reachLeft = false;
            }

            if (cx < width - 1) {
                if (matchStartColor(currentPos + 4)) {
                    if (!reachRight) {
                        pixelStack.push([cx + 1, cy]);
                        reachRight = true;
                    }
                } else if (reachRight) reachRight = false;
            }

            cy += 1;
            currentPos += width * 4;
        }
    }
    
    // 5. Apply the modified pixel array back to the canvas
    ctx.putImageData(imageData, 0, 0);
}
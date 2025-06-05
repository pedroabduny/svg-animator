# SVG Animator - Stroke Animation Tool

A beautiful web application for creating stroke animations from SVG files, similar to After Effects text animations. Convert your SVG graphics into animated GIFs with customizable stroke effects.

## 🌟 Features

- **SVG Upload**: Drag & drop or browse to upload SVG files
- **Stroke Animation**: Creates smooth stroke completion animations
- **Customizable Controls**: 
  - Animation duration (0.5 - 5 seconds)
  - Animation delay (0 - 2 seconds)
  - Stroke width (1 - 10px)
  - Stroke color picker
- **Live Preview**: Real-time animation preview
- **GIF Export**: Export animations as downloadable GIF files
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, professional interface with smooth animations

## 🚀 Getting Started

1. **Open the Application**
   - Open `index.html` in your web browser
   - No server setup required - it runs entirely in the browser!

2. **Upload Your SVG**
   - Click the upload area or drag & drop an SVG file
   - Use the provided `sample.svg` to test the functionality

3. **Customize Animation**
   - Adjust duration, delay, stroke width, and color
   - Watch the live preview update in real-time

4. **Preview & Export**
   - Click "Play Animation" to preview
   - Click "Export GIF" to download your animated GIF

## 📁 File Structure

```
SVG Animator/
├── index.html          # Main HTML file
├── styles.css          # Styling and animations
├── script.js           # Core application logic
├── sample.svg          # Sample SVG for testing
└── README.md           # Documentation
```

## 🎨 How It Works

The application converts SVG shapes into animatable paths using stroke-dasharray and stroke-dashoffset properties:

1. **SVG Processing**: Converts shapes (circles, rectangles, lines) to paths
2. **Path Analysis**: Calculates path lengths for precise animation timing
3. **Animation Setup**: Applies CSS animations and SVG `<animate>` elements
4. **GIF Generation**: Uses HTML5 Canvas and gif.js to create downloadable GIFs

## 🛠️ Technical Details

### Dependencies
- **gif.js**: For GIF generation (loaded via CDN)
- **Inter Font**: Modern typography (loaded via Google Fonts)

### Browser Support
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+

### SVG Compatibility
- Supports most SVG elements: `path`, `line`, `circle`, `rect`, `polygon`, `polyline`
- Automatically converts shapes to paths for consistent animation
- Preserves original SVG attributes and styling

## 🎯 Usage Tips

1. **Best SVG Types**:
   - Line art and outlines work best
   - Avoid complex filled shapes
   - Text converted to paths animates beautifully

2. **Performance**:
   - Keep SVGs under 1MB for best performance
   - Complex paths may take longer to process
   - GIF export time depends on animation duration

3. **Animation Settings**:
   - Use 2-3 second durations for optimal viewing
   - Add slight delays for staggered effects
   - Experiment with stroke colors for visual impact

## 🔧 Customization

The application is built with modular JavaScript classes. You can easily:

- Modify animation easing functions in `script.js`
- Adjust UI colors and styling in `styles.css`
- Add new export formats by extending the export functionality
- Customize animation types by modifying the `updateAnimation()` method

## 🐛 Troubleshooting

**SVG won't upload?**
- Ensure file has `.svg` extension
- Check that file is valid SVG format
- Try using the provided `sample.svg` first

**Animation not working?**
- Some complex SVGs may need manual optimization
- Ensure SVG has drawable paths/shapes
- Check browser developer console for errors

**GIF export fails?**
- Disable ad blockers (they may block web workers)
- Try shorter animation duration
- Ensure stable internet connection for CDN resources

## 📱 Mobile Support

The application is fully responsive and works on mobile devices:
- Touch-friendly interface
- Responsive controls layout
- Mobile-optimized file upload

## 🌐 Browser Permissions

No special permissions required! The application:
- Runs entirely in the browser
- No data sent to external servers
- Uses local file processing only

## 🎉 Sample Usage

1. Load the provided `sample.svg`
2. Set duration to 3 seconds
3. Choose a bright stroke color
4. Click "Play Animation" to preview
5. Export as GIF and share!

---

**Enjoy creating beautiful SVG animations!** 🎨✨ 
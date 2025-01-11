const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sharp = require('sharp');
const ffmpeg = require('ffmpeg-static');
const ffprobe = require('@ffprobe-installer/ffprobe').path;

async function processVideo() {
    const inputPath = path.join(__dirname, 'bgvideo.mp4');
    
    // Verify input file exists
    if (!fs.existsSync(inputPath)) {
        console.error('Error: bgvideo.mp4 not found! Make sure it\'s in the same folder as this script.');
        return;
    }

    console.log('Starting video processing...');

    // Create temp directory
    const tempDir = path.join(__dirname, 'temp_frames');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    try {
        // Extract frames
        console.log('Extracting frames...');
        execSync(`"${ffmpeg}" -i "${inputPath}" -qscale:v 1 -vf fps=30 "${tempDir}/frame-%d.png"`, { stdio: 'inherit' });

        // Process each frame
        console.log('Processing frames with blur effect...');
        const files = fs.readdirSync(tempDir).filter(f => f.endsWith('.png'));
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const framePath = path.join(tempDir, file);
            console.log(`Processing frame ${i + 1}/${files.length}`);
            
            // Create blur effect
            const image = await sharp(framePath);
            const blurred = await image
                .clone()
                .blur(8)
                .modulate({ brightness: 0.7 })
                .toBuffer();

            await sharp(framePath)
                .composite([
                    {
                        input: blurred,
                        blend: 'overlay',
                        opacity: 0.5
                    },
                    {
                        input: Buffer.from([17, 24, 39, 77]),
                        raw: {
                            width: 1,
                            height: 1,
                            channels: 4
                        },
                        blend: 'overlay'
                    }
                ])
                .toFile(framePath.replace('.png', '-processed.png'));
        }

        // Combine frames back to video
        console.log('Creating final video...');
        const outputPath = path.join(__dirname, 'processed_video.mp4');
        execSync(`"${ffmpeg}" -framerate 30 -i "${tempDir}/frame-%d-processed.png" -c:v libx264 -preset slow -crf 18 -movflags +faststart "${outputPath}"`, { stdio: 'inherit' });

        // Cleanup
        console.log('Cleaning up temporary files...');
        fs.readdirSync(tempDir).forEach(f => fs.unlinkSync(path.join(tempDir, f)));
        fs.rmdirSync(tempDir);

        // Compare sizes
        const inputSize = fs.statSync(inputPath).size;
        const outputSize = fs.statSync(outputPath).size;
        console.log('\nProcessing complete!');
        console.log(`Input size: ${(inputSize / 1024 / 1024).toFixed(2)}MB`);
        console.log(`Output size: ${(outputSize / 1024 / 1024).toFixed(2)}MB`);
        console.log(`Size difference: ${(((outputSize - inputSize) / inputSize) * 100).toFixed(2)}%`);

    } catch (error) {
        console.error('Error occurred:', error);
        // Cleanup on error
        if (fs.existsSync(tempDir)) {
            fs.readdirSync(tempDir).forEach(f => fs.unlinkSync(path.join(tempDir, f)));
            fs.rmdirSync(tempDir);
        }
    }
}

processVideo();
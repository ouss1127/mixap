import React, { useEffect, useState, useRef, useCallback } from 'react';
import Layout from '../components/Layout';
import SEO from "../components/seo"
import { useDropzone } from 'react-dropzone';
import classnames from 'classnames';
import { loadImage, resizeImage, drawResultImage, computeStatistics } from '../lib/compiler-utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import sampleImg1 from '../images/sample-analyze1.jpg';
import sampleImg2 from '../images/sample-analyze2.png';
import sampleImg3 from '../images/sample-analyze3.png';
import sampleImg4 from '../images/sample-analyze4.png';
import '../styles/compiler.scss';

const Stars = ({ title, score }) => {
	return (
		<div>
			<span className="title">{title}</span>
			{[...Array(10).keys()].map((i) => {
				return (
					<span key={i}>
						{score * 10 > i && (
							<FontAwesomeIcon icon={['fa', 'star']} />
						)}
						{score * 10 <= i && (
							<FontAwesomeIcon icon={['far', 'star']} />
						)}
					</span>
				)
			})}
		</div>
	)
}

const ImageAnalyzer = () => {
	const [status, setStatus] = useState(null);
	const [compilePercent, setCompilePercent] = useState(0);
	const [stats, setStats] = useState(null);
	const [results, setResults] = useState(null);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const resultImageRef = useRef(null);

	const reset = useCallback(() => {
		setStats(null);
		setStatus(null);
		setCompilePercent(0);
	}, [setStats, setStatus, setCompilePercent]);


	const compile = useCallback(async (image) => {
		setStatus("compiling");

		const resizedImage = await resizeImage(image, { targetSize: 800 });
		const compiler = new window.MINDAR.Compiler();
		setCompilePercent(0);
		await compiler.compileImageTargets([resizedImage], (progress) => {
			setCompilePercent(progress);
		});
		setStatus("compiled");

		const { imageList, matchingData } = compiler.data[0];

		const results = [];
		for (let i = 0; i < imageList.length; i++) {
			const targetImage = imageList[i];
			const points = [...matchingData[i].maximaPoints, ...matchingData[i].minimaPoints];
			const resultImage = drawResultImage(targetImage, points);
			results.push({ points, resultImage, width: targetImage.width, height: targetImage.height });


			if (i === 0) {
				const stats = computeStatistics(targetImage, matchingData[i].maximaPoints, matchingData[i].minimaPoints);
				const minDimension = Math.min(image.width, image.height);
				const maxDimension = Math.max(image.width, image.height);
				const ratio = minDimension / maxDimension;

				let sizeScore = 5;
				if (minDimension < 1000) sizeScore = 4;
				if (minDimension < 800) sizeScore = 3;
				if (minDimension < 600) sizeScore = 2;
				if (minDimension < 400) sizeScore = 1;
				if (minDimension < 200) sizeScore = 0;

				let ratioScore = 5;
				if (ratio < 0.8) ratioScore = 4;
				if (ratio < 0.8) ratioScore = 3;
				if (ratio < 0.6) ratioScore = 2;
				if (ratio < 0.4) ratioScore = 1;
				if (ratio < 0.2) ratioScore = 0;

				let dimensionScore = (sizeScore + ratioScore) / 10;
				//console.log("dim", sizeScore, ratioScore, minDimension, maxDimension, ratio);

				setStats(Object.assign({ dimension: dimensionScore }, stats));
			}
		}
		//console.log("results", results, stats);
		setResults(results);
		setSelectedImageIndex(0);
	}, [setSelectedImageIndex, setStats, setStatus, setCompilePercent, setResults]);

	const runSample = useCallback(async (e) => {
		const image = e.target;
		compile(image);
	}, [compile]);

	const onDrop = useCallback(async (acceptedFiles) => {
		const file = acceptedFiles[0];
		const image = await loadImage(file);
		compile(image);
	}, [compile]);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

	useEffect(() => {
		if (!results || !results[selectedImageIndex]) return;

		const { resultImage } = results[selectedImageIndex];
		resultImageRef.current.src = resultImage.src;
	}, [selectedImageIndex, results]);

	return (
		<Layout>
			<SEO title="Pictarize | AR target image analyzer" />
			<div className="compiler">
				<div className="header">
					<div className="container">
						<div className="brand">
							<a href="/">
								<h1>Pictarize</h1>
								<h2>Augmenting any pictures</h2>
							</a>
						</div>
						<div className="items">
						</div>
					</div>
				</div>

				<div className="intro container">
					<p>This tool analyzes how well an image is for detection and tracking. It is mainly used for augmented reality.</p>
					<p>
						If you are interested in the theory behind, check out this <a href="https://blog.pictarize.com/how-to-choose-a-good-target-image-for-tracking-in-ar-part-4/">article</a>.
					</p>
				</div>

				<div className="main container">
					{status === null &&
						<div className="samples">
							Try a sample or upload an image
							<div className="items">
								<img src={sampleImg1} onClick={runSample} />
								<img src={sampleImg2} onClick={runSample} />
								<img src={sampleImg3} onClick={runSample} />
								<img src={sampleImg4} onClick={runSample} />
							</div>
						</div>
					}

					{status === null &&
						<div className="dropzone" {...getRootProps()}>

							<input {...getInputProps()} />
							<p>Drop an image, or click to select</p>
						</div>
					}

					{status === 'compiling' &&
						<div>Analyzing... ({compilePercent.toFixed(2)} %)</div>
					}

					{status === 'compiled' &&
						<div className="result-container">
							<button className="button" onClick={reset}>Try another image</button>

							{stats &&
								<div className="overall">
									<Stars title={"Feature Distribution"} score={stats.fill} />
									<Stars title={"Feature Uniqueness"} score={stats.unique} />
									<Stars title={"Image Dimension"} score={stats.dimension} />
								</div>
							}

							<div className="images-container">
								<div className="top">
									Feature points visualization in different scales
								</div>
								<div className="middle">
									<div className="selection-col">
										{results && results.map((result, index) => (
											<div className={"item" + (index === selectedImageIndex ? " selected" : "")} key={index} onClick={() => { setSelectedImageIndex(index) }}>
												{result.width} x {result.height}
											</div>
										))}
									</div>
									<div className="images-col">
										<img ref={resultImageRef} />
									</div>
								</div>
							</div>
						</div>
					}

					{status === 'compiled' &&
						<div className="notes container">
							<h1>Notes</h1>
							<ul>
								<li><strong>Feature Distribution</strong> indicates whether feature points can be detected in different area of the images. It's generally bad if there is large area of blank space, in which there is no feature points. Moreover, blank space on the outside is worse than those inside.</li>
								<li><strong>Feature Uniqueness</strong> indicates whether the detected feature points are look alike. It's generally bad if they are similar. You should avoid repeatitive patterns or symmetry to improve uniqueness.</li>
								<li><strong>Image dimension</strong> indicates whether the resolution and aspect ratio is good. An image of at least 1000px width and 1000px height is pretty good. Beside, aspect ratio of 1 is prefer. But it's ok to be non-square as long as it's not too extreme. </li>
								<li><strong>Feature Visualization</strong> gives you an general idea of where are the detected feature points, in different image scales.</li>
							</ul>
						</div>
					}
				</div>
			</div>
		</Layout>
	)
}

export default ImageAnalyzer;


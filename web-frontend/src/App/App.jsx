import classNames from "classnames";
import { useCallback, useRef, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { extractAudio } from "../extractAudios";
import styles from "./App.module.css";

const App = () => {
    const audioInputRef = useRef(null);

    const [segments, setSegments] = useState([]);
    const addSegment = useCallback(
        (newSegment) => {
            const newSegments = [...segments, newSegment];
            setSegments(newSegments);
        },
        [segments],
    );
    const removeSegment = useCallback(
        (index) => {
            const newSegments = segments.filter((segment, segmentIndex) => {
                return segmentIndex !== index;
            });
            setSegments(newSegments);
        },
        [segments],
    );
    const updateSegment = useCallback(
        (index, key, value) => {
            const newSegments = [...segments];
            newSegments[index][key] = value;
            setSegments(newSegments);
        },
        [segments],
    );

    const onAddSegment = useCallback(() => {
        addSegment({
            start: "0",
            end: "0",
            name: "",
        });
    }, [addSegment]);

    const onExtract = useCallback(() => {
        if (!audioInputRef.current) {
            return;
        }
        const audioFile = audioInputRef.current.files?.[0];
        if (!audioFile) {
            alert("upload audio file first");
        }
        if (!segments.length) {
            alert("add segments first");
            return;
        }
        try {
            extractAudio(audioFile, segments);
        } catch (error) {
            alert(error);
        }
    }, [segments]);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>audio extractor</h1>
            <div className={styles.divider}></div>
            <div className={styles.inputContainer}>
                <h3 className={styles.label}>audio file</h3>
                <input type="file" ref={audioInputRef} accept="audio/*" />
            </div>
            <div className={styles.divider}></div>
            <h3 className={styles.title}>segments</h3>

            {segments.map((segment, index) => {
                const onChange = (key) => (event) => {
                    updateSegment(index, key, event.target.value);
                };
                return (
                    <div className={styles.segment} key={index}>
                        <div className={styles.inputContainer}>
                            <label className={styles.label}>
                                start (seconds)
                            </label>
                            <input
                                type="number"
                                value={segment.start}
                                onChange={onChange("start")}
                            />
                        </div>
                        <div className={styles.inputContainer}>
                            <label className={styles.label}>
                                end (seconds)
                            </label>
                            <input
                                type="number"
                                value={segment.end}
                                onChange={onChange("end")}
                            />
                        </div>
                        <div
                            className={classNames(
                                styles.inputContainer,
                                styles.flex1,
                            )}
                        >
                            <label className={styles.label}>name</label>
                            <input
                                type="text"
                                value={segment.name}
                                onChange={onChange("name")}
                            />
                        </div>
                        <FaTrash
                            className={styles.trashIcon}
                            onClick={() => removeSegment(index)}
                        />
                    </div>
                );
            })}
            <button className={styles.addSegmentButton} onClick={onAddSegment}>
                add segment
            </button>
            <div className={styles.divider}></div>
            <button disabled={segments.length === 0} onClick={onExtract}>
                extract audios
            </button>
        </div>
    );
};

export default App;

"use client";

import { useState } from "react";

import { api } from "@/trpc/react";
import styles from "../index.module.css";

export function LatestForm() {
	const [latestForm] = api.form.getLatest.useSuspenseQuery();

	const utils = api.useUtils();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const createForm = api.form.create.useMutation({
		onSuccess: async () => {
			await utils.form.invalidate();
			setTitle("");
			setDescription("");
		},
	});

	return (
		<div className={styles.showcaseContainer}>
			{latestForm ? (
				<p className={styles.showcaseText}>
					Your most recent form: {latestForm.title}
				</p>
			) : (
				<p className={styles.showcaseText}>You have no forms yet.</p>
			)}

			<form
				onSubmit={(e) => {
					e.preventDefault();
					createForm.mutate({ title, description });
				}}
				className={styles.form}
			>
				<input
					type="text"
					placeholder="Form Title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					className={styles.input}
				/>
				<textarea
					placeholder="Description (optional)"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					className={styles.input}
					rows={3}
				/>
				<button
					type="submit"
					className={styles.submitButton}
					disabled={createForm.isPending}
				>
					{createForm.isPending ? "Submitting..." : "Submit"}
				</button>
			</form>
		</div>
	);
}

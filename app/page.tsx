import styles from './styles.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Home</h1>
      <div className={styles.contentBox}>
        <p>
          Welcome to our platform. Get started by exploring our features.
        </p>
      </div>
    </div>
  );
}
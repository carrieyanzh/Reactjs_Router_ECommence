import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { fetchCategories } from "./../../features/categories/categoriesSlice";
import styles from "./Shop.module.css";

export default function Categories() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  if (loading) return <p>Loading categories...</p>;
  if (error) return <p>Unable to load categories: {error}</p>;

  return (
    <div className={styles.page}>
      <h1>Shop by Categories</h1>
      <p>Explore our product collections.</p>

      <div className={styles.categoryGrid}>
        {items.map((category) => (
          <div className={styles.categoryCard} key={category.id}>
            <div className={styles.categoryIcon}>{category.emoji}</div>

            <h3>{category.name}</h3>
            <p>{category.description}</p>
            <p>{category.product_count} Products</p>

            <Link
              to={`/shop?categoryId=${category.id}`}
              className={styles.primaryButton}
            >
              Explore →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

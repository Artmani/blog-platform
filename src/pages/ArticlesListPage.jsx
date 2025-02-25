import React, { useState } from 'react'
import { useGetArticlesQuery } from '../store/articlesApi'
import { List, Card, Pagination, Spin, Alert } from 'antd'
import { HeartOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import styles from '../styles/ArticlesListPage.module.scss'

const ArticlesListPage = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const navigate = useNavigate()

  const { data, error, isLoading } = useGetArticlesQuery({
    page: currentPage,
    limit: pageSize,
  })

  if (isLoading) return <Spin size="large" className={styles.loading} />
  if (error) return <Alert message="Error loading articles" type="error" />

  const articles = data?.articles || []
  const totalArticles = data?.articlesCount || 0

  return (
    <div className={styles.container}>
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={articles}
        renderItem={(article) => (
          <List.Item>
            <Card className={styles.card}>
              <div className={styles.cardContent}>
                <div className={styles.left}>
                  <div className={styles.titleRow}>
                    <h2 className={styles.title} onClick={() => navigate(`/articles/${article.slug}`)}>
                      {article.title}
                    </h2>
                    <span className={styles.likes}>
                      <HeartOutlined /> {article.favoritesCount}
                    </span>
                  </div>
                  <div className={styles.tags}>
                    {article.tagList.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className={styles.description}>{article.description}</p>
                </div>
                <div className={styles.right}>
                  <img
                    src={article.author.image || 'https://via.placeholder.com/50'}
                    alt={article.author.username}
                    className={styles.avatar}
                  />
                  <p className={styles.author}>{article.author.username}</p>
                  <p className={styles.date}>{new Date(article.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={totalArticles}
        onChange={(page) => setCurrentPage(page)}
        className={styles.pagination}
      />
    </div>
  )
}

export default ArticlesListPage

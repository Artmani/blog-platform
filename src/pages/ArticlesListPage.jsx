import React, { useState } from 'react'
import { List, Card, Pagination, Spin, Alert } from 'antd'
import { HeartOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useGetArticlesQuery } from '../store/articlesApi'
import styles from '../styles/ArticlesListPage.module.scss'

function ArticlesListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page'), 10) || 1)
  const pageSize = 10
  const navigate = useNavigate()

  const { data, error, isLoading } = useGetArticlesQuery({
    offset: (currentPage - 1) * pageSize,
    limit: pageSize,
  })

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    )
  }
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Alert message="Error loading articles" type="error" />
      </div>
    )
  }

  const articles = data?.articles || []
  const totalArticles = data?.articlesCount || 0

  const getUniqueKey = (article, index) => `${article.slug}-${article.createdAt}-${index}`

  const handlePageChange = (page) => {
    setCurrentPage(page)
    setSearchParams({ page })
  }

  return (
    <div className={styles.container}>
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={articles}
        renderItem={(article, index) => {
          const uniqueKey = getUniqueKey(article, index)
          const showPlaceholder = !article.author?.image || article.author.image === ''

          return (
            <List.Item key={uniqueKey}>
              <Card className={styles.card}>
                <div className={styles.cardContent}>
                  <div className={styles.left}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/articles/${article.slug}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          navigate(`/articles/${article.slug}`)
                        }
                      }}
                      className={styles.titleRow}
                    >
                      <h2 className={styles.title}>{article.title}</h2>
                      <span className={styles.likes}>
                        <HeartOutlined /> {article.favoritesCount || 0}
                      </span>
                    </div>
                    <div className={styles.tags}>
                      {article.tagList?.map((tag, tagIndex) => (
                        <span key={`${uniqueKey}-tag-${tag}-${tagIndex}`} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className={styles.description}>{article.description}</p>
                  </div>
                  <div className={styles.right}>
                    <div className={styles.avatarContainer}>
                      {article.author?.image && !showPlaceholder ? (
                        <img
                          src={article.author.image}
                          alt={article.author?.username || 'Author'}
                          className={styles.avatar}
                          onError={(e) => {
                            const { target } = e
                            target.style.display = 'none'
                            target.parentElement.classList.add(styles.showPlaceholder)
                          }}
                        />
                      ) : (
                        <div
                          className={`${styles.avatarPlaceholder} ${showPlaceholder ? styles.showPlaceholder : ''}`}
                          title={article.author?.username || 'Author'}
                        >
                          {article.author?.username?.charAt(0).toUpperCase() || 'A'}
                        </div>
                      )}
                    </div>
                    <p className={styles.author}>{article.author?.username || 'Anonymous'}</p>
                    <p className={styles.date}>{new Date(article.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>
            </List.Item>
          )
        }}
      />

      <Pagination
        align="center"
        current={currentPage}
        pageSize={pageSize}
        total={totalArticles}
        onChange={handlePageChange}
        className={styles.pagination}
        showSizeChanger={false}
      />
    </div>
  )
}

export default ArticlesListPage

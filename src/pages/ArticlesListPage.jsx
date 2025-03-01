import React, { useState } from 'react'
import { List, Card, Pagination, Spin, Alert } from 'antd'
import { HeartOutlined, HeartFilled } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { useGetArticlesQuery, useFavoriteArticleMutation, useUnfavoriteArticleMutation } from '../store/articlesApi'
import styles from '../styles/ArticlesListPage.module.scss'

function ArticlesListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialPage = parseInt(searchParams.get('page'), 10) || 1
  const [currentPage, setCurrentPage] = useState(initialPage)
  const pageSize = 10
  const navigate = useNavigate()
  const user = useSelector((state) => state.user.user)

  const { data, error, isLoading, refetch } = useGetArticlesQuery({
    offset: (currentPage - 1) * pageSize,
    limit: pageSize,
  })

  const [favoriteArticle] = useFavoriteArticleMutation()
  const [unfavoriteArticle] = useUnfavoriteArticleMutation()

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
        <Alert message="Ошибка загрузки статей" type="error" />
      </div>
    )
  }

  const articles = data?.articles || []
  const totalArticles = data?.articlesCount || 0

  const handlePageChange = (page) => {
    setCurrentPage(page)
    setSearchParams({ page: page.toString() })
  }

  const handleLikeClick = async (slug, favorited) => {
    if (!user) {
      toast.error('Пожалуйста, войдите в систему, чтобы оценить статью')
      navigate('/sign-in')
      return
    }
    try {
      if (favorited) {
        await unfavoriteArticle(slug).unwrap()
      } else {
        await favoriteArticle(slug).unwrap()
      }
      refetch()
    } catch (err) {
      toast.error('Ошибка обновления лайка')
    }
  }

  return (
    <div className={styles.container}>
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={articles}
        renderItem={(article, idx) => {
          const uniqueKey = `${article.slug}-${article.createdAt}-${idx}`
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
                    </div>
                    <div className={styles.tags}>
                      {article.tagList?.map((tag, index) => (
                        <span key={`${uniqueKey}-tag-${tag}-${index}`} className={styles.tag}>
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
                          alt={article.author?.username || 'Автор'}
                          className={styles.avatar}
                          onError={(e) => {
                            const tgt = e.target
                            tgt.style.display = 'none'
                            if (tgt.parentElement) {
                              tgt.parentElement.classList.add(styles.showPlaceholder)
                            }
                          }}
                        />
                      ) : (
                        <div
                          className={`${styles.avatarPlaceholder} ${showPlaceholder ? styles.showPlaceholder : ''}`}
                          title={article.author?.username || 'Автор'}
                        >
                          {article.author?.username?.charAt(0).toUpperCase() || 'A'}
                        </div>
                      )}
                    </div>
                    <p className={styles.author}>{article.author?.username || 'Аноним'}</p>
                    <p className={styles.date}>{new Date(article.createdAt).toLocaleDateString()}</p>
                    <div
                      className={styles.likes}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleLikeClick(article.slug, article.favorited)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleLikeClick(article.slug, article.favorited)
                        }
                      }}
                      style={{ cursor: 'pointer', marginTop: '8px' }}
                    >
                      {article.favorited ? <HeartFilled style={{ color: 'red' }} /> : <HeartOutlined />}{' '}
                      {article.favoritesCount || 0}
                    </div>
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

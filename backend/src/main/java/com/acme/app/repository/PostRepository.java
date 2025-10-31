package com.acme.app.repository;

import com.acme.app.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    Optional<Post> findBySlug(String slug);

    List<Post> findByFeaturedTrueOrderByCreatedAtDesc();

    List<Post> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    @Query("SELECT p FROM Post p WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.excerpt) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Post> searchByQuery(@Param("query") String query);

    @Query("SELECT p FROM Post p WHERE :tag MEMBER OF p.tags")
    List<Post> findByTag(@Param("tag") String tag);

    List<Post> findAllByOrderByCreatedAtDesc();
}

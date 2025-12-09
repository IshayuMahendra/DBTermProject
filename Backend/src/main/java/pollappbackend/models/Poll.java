package pollappbackend.models;

import java.sql.Timestamp;

public class Poll {

    private int pollId;
    private String title;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    private int creatorId;
    private String imageId;

    // getters and setters

    public Integer getPollId() {
        return pollId;
    } // getPollId

    public void setPollId(Integer pollId) {
        this.pollId = pollId;
    } // setPollId

    public String getTitle() {
        return title;
    } // getTitle
    
    public void setTitle(String title) {
        this.title = title;
    } // setTitle

    public Timestamp getCreatedAt() {
        return createdAt;
    } // getCreatedAt

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    } // setCreatedAt

    public Timestamp getUpdatedAt() {
        return updatedAt;
    } // getUpdatedAt

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    } // setUpdatedAt

    public Integer getCreatorId() {
        return creatorId;
    } // getCreatorId

    public void setCreatorId(Integer creatorId) {
        this.creatorId = creatorId;
    } // setCretorId

    public String getImageId() {
        return imageId;
    } // getImageId

    public void setImageId(String imageId) {
        this.imageId = imageId;
    } // setImageId
    
} // Poll

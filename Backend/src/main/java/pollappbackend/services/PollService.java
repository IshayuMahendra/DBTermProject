package pollappbackend.services;

import org.springframework.stereotype.Service;
import javax.sql.DataSource;
import java.sql.*;
import java.util.List;
import pollappbackend.models.Poll;
import pollappbackend.models.PollOption;
import java.util.ArrayList;

@Service
public class PollService {

    private final DataSource dataSource;

    public PollService(DataSource dataSource) {
        this.dataSource = dataSource;
    } // PollService

    public int createPoll(String title, int creatorId, String imageId, List<String> options) {
        String pollSql = "INSERT INTO Poll (title, creator_id, image_id, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())";
        String optionSql = "INSERT INTO PollOption (poll_id, text, votes) VALUES (?, ?, 0)";

        Connection conn = null;

        try {
            conn = dataSource.getConnection();
            conn.setAutoCommit(false); 

            // Insert into Poll and get poll_id
            int pollId;

            try (PreparedStatement pollStmt = conn.prepareStatement(
                    pollSql,
                    Statement.RETURN_GENERATED_KEYS
            )) {
                pollStmt.setString(1, title);
                pollStmt.setInt(2, creatorId);

                if (imageId != null) {
                    pollStmt.setString(3, imageId);
                } else {
                    pollStmt.setNull(3, Types.VARCHAR);
                } // if

                pollStmt.executeUpdate();

                try (ResultSet keys = pollStmt.getGeneratedKeys()) {
                    if (keys.next()) {
                        pollId = keys.getInt(1);
                    } else {
                        conn.rollback();
                        return -1;
                    } // if
                } // try catch
            } // try catch

            //options for the poll
            try (PreparedStatement optStmt = conn.prepareStatement(optionSql)) {
                for (String optText : options) {
                    optStmt.setInt(1, pollId);
                    optStmt.setString(2, optText);
                    optStmt.addBatch();
                } // for
                optStmt.executeBatch();
            } // try catch

            conn.commit();
            return pollId;

        } catch (Exception e) {
            e.printStackTrace();
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            } // if
            return -1;

        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        } // try catch
    } // createPoll

    public Poll getPollById(int pollId) {
        String sql = "SELECT poll_id, title, created_at, updated_at, creator_id, image_id " +
                    "FROM Poll WHERE poll_id = ?";

        try (Connection conn = dataSource.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, pollId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Poll p = new Poll();
                    p.setPollId(rs.getInt("poll_id"));
                    p.setTitle(rs.getString("title"));
                    p.setCreatedAt(rs.getTimestamp("created_at"));
                    p.setUpdatedAt(rs.getTimestamp("updated_at"));
                    p.setCreatorId(rs.getInt("creator_id"));
                    p.setImageId(rs.getString("image_id"));
                    return p;
                }
            }

            return null;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    } // getpollById

    public List<PollOption> getOptionsForPoll(int pollId) {
        // shows voting results as percentages for each option on poll
        String sql = "SELECT o.option_id, o.poll_id, o.text, COUNT(v.vote_id) AS votes_for_option FROM PollOption o LEFT JOIN Vote v ON v.option_id = o.option_id WHERE o.poll_id = ? GROUP BY o.option_id, o.poll_id, o.text ORDER BY o.option_id";

        List<PollOption> options = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, pollId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    PollOption opt = new PollOption();
                    opt.setOptionId(rs.getInt("option_id"));
                    opt.setPollId(rs.getInt("poll_id"));
                    opt.setText(rs.getString("text"));
                    opt.setVotes(rs.getInt("votes_for_option"));
                    options.add(opt);
                }
            }

            return options;

        } catch (Exception e) {
            e.printStackTrace();
            return options;
        }
    } // getOptionsForPoll

    public List<Poll> getAllPolls() {
        // gets all polls for the home page and total votes per poll
        String sql = "SELECT p.poll_id, p.title, p.created_at, p.updated_at, p.creator_id, p.image_id, COUNT(v.vote_id) AS total_votes FROM Poll p LEFT JOIN Vote v ON v.poll_id = p.poll_id GROUP BY p.poll_id, p.title, p.created_at, p.updated_at, p.creator_id, p.image_id ORDER BY p.created_at DESC";

        List<Poll> polls = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Poll p = new Poll();
                p.setPollId(rs.getInt("poll_id"));
                p.setTitle(rs.getString("title"));
                p.setCreatedAt(rs.getTimestamp("created_at"));
                p.setUpdatedAt(rs.getTimestamp("updated_at"));
                p.setCreatorId(rs.getInt("creator_id"));
                p.setImageId(rs.getString("image_id"));
                polls.add(p);
            } // while

            return polls;

        } catch (Exception e) {
            e.printStackTrace();
            return polls;
        } // try catch
    } // getAllPolls

    public List<Poll> getUnvotedPollsForUser(int userId) {
        // gets polls user has not voted on
        String sql = "SELECT DISTINCT p.poll_id, p.title, p.created_at, p.updated_at, p.creator_id, p.image_id FROM Poll p LEFT JOIN Vote v ON p.poll_id = v.poll_id AND v.user_id = ? WHERE v.vote_id IS NULL ORDER BY p.created_at DESC";

        List<Poll> polls = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, userId);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Poll p = new Poll();
                    p.setPollId(rs.getInt("poll_id"));
                    p.setTitle(rs.getString("title"));
                    p.setCreatedAt(rs.getTimestamp("created_at"));
                    p.setUpdatedAt(rs.getTimestamp("updated_at"));
                    p.setCreatorId(rs.getInt("creator_id"));
                    String imageId = rs.getString("image_id");
                    p.setImageId(imageId);
                    polls.add(p);
                } // while
            } // try

        } catch (SQLException e) {
            e.printStackTrace();
        } // try catch

        return polls;
    } // getUnvotedPollsForUser

    public List<Poll> getPollsByCreator(int creatorId) {
        String sql = "SELECT p.* FROM Poll p WHERE p.creator_id = ? ORDER BY p.created_at DESC";

        List<Poll> polls = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, creatorId);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Poll p = new Poll();
                    p.setPollId(rs.getInt("poll_id"));
                    p.setTitle(rs.getString("title"));
                    p.setCreatedAt(rs.getTimestamp("created_at"));
                    p.setUpdatedAt(rs.getTimestamp("updated_at"));
                    p.setCreatorId(rs.getInt("creator_id"));

                    String imageId = rs.getString("image_id"); // can be null
                    p.setImageId(imageId);

                    polls.add(p);
                } // while
            } // try

        } catch (SQLException e) {
            e.printStackTrace();
        } // try catch

        return polls;
    } // getPollsByCreator

    public boolean hasUserVoted(int pollId, int userId) {
        String sql = "SELECT 1 FROM Vote WHERE poll_id = ? AND user_id = ? LIMIT 1";

        try (Connection conn = dataSource.getConnection();
            PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, pollId);
            stmt.setInt(2, userId);

            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next(); // true if at least one row
            } // try
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        } // try catch
    } // hasUserVoted

} // PollService

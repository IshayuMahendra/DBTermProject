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
        String sql = "SELECT option_id, poll_id, text, votes " +
                    "FROM PollOption WHERE poll_id = ? ORDER BY option_id";

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
                    opt.setVotes(rs.getInt("votes"));
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
        String sql = "SELECT poll_id, title, created_at, updated_at, creator_id, image_id " +
                    "FROM Poll ORDER BY created_at DESC";

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
        String sql = "SELECT p.* FROM Poll p WHERE NOT EXISTS (SELECT 1 FROM Vote v WHERE v.poll_id = p.poll_id AND v.user_id = ?) ORDER BY p.created_at DESC";

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

} // PollService

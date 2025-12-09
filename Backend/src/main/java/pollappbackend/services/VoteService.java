package pollappbackend.services;

import org.springframework.stereotype.Service;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@Service
public class VoteService {
    
    private final DataSource dataSource;

    public VoteService(DataSource dataSource) {
        this.dataSource = dataSource;
    } // VoteService

    public boolean hasUserVoted(int pollId, int userId) {
        String sql = "SELECT COUNT(*) FROM Vote WHERE poll_id = ? AND user_id = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, pollId);
            ps.setInt(2, userId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                } // if
            } // try

            return false;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        } // try catch
    } // hasUserVoted

    public boolean castVote(int pollId, int optionId, int userId) {
        String insertVoteSql =
                "INSERT INTO Vote (poll_id, option_id, user_id, voted_at) " +
                "VALUES (?, ?, ?, NOW())";

        String updateOptionSql =
                "UPDATE PollOption SET votes = votes + 1 WHERE option_id = ?";

        Connection conn = null;

        try {
            conn = dataSource.getConnection();
            conn.setAutoCommit(false); 

            try (PreparedStatement ps = conn.prepareStatement(insertVoteSql)) {
                ps.setInt(1, pollId);
                ps.setInt(2, optionId);
                ps.setInt(3, userId);
                ps.executeUpdate();
            } // try

            try (PreparedStatement ps = conn.prepareStatement(updateOptionSql)) {
                ps.setInt(1, optionId);
                ps.executeUpdate();
            } // try

            conn.commit();
            return true;

        } catch (Exception e) {
            e.printStackTrace();
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            } // if
            return false;

        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                } // try catch
            } // if
        } // try catch
    } // castVote

} // VoteService 

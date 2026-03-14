"""create core nomadcal tables

Revision ID: 20260314_01
Revises:
Create Date: 2026-03-14 14:50:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "20260314_01"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "destinations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("country", sa.String(length=60), nullable=False),
        sa.Column("state", sa.String(length=60), nullable=True),
        sa.Column("dest_type", sa.String(length=30), nullable=False),
        sa.Column("best_months", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("avg_cost_per_day", sa.Integer(), nullable=True),
        sa.Column("activities", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("tags", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("image_url", sa.String(length=500), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_destinations_name"), "destinations", ["name"], unique=False)

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("home_city", sa.String(length=100), nullable=True),
        sa.Column("auth_provider", sa.String(length=20), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "trips",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("destination_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("duration_days", sa.SmallInteger(), nullable=False),
        sa.Column("estimated_budget", sa.Integer(), nullable=True),
        sa.Column("itinerary", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("match_score", sa.Float(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["destination_id"], ["destinations.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "user_calendars",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("year", sa.SmallInteger(), nullable=False),
        sa.Column("total_leaves", sa.Integer(), nullable=False),
        sa.Column("leaves_used", sa.Integer(), nullable=False),
        sa.Column("leave_dates", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("preferred_months", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("blackout_dates", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "user_preferences",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("travel_style", sa.String(length=20), nullable=False),
        sa.Column("budget_per_trip", sa.Integer(), nullable=True),
        sa.Column("annual_budget", sa.Integer(), nullable=True),
        sa.Column("group_type", sa.String(length=20), nullable=False),
        sa.Column("activity_interests", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("domestic_international", sa.String(length=20), nullable=False),
        sa.Column("comfort_level", sa.String(length=20), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )


def downgrade() -> None:
    op.drop_table("user_preferences")
    op.drop_table("user_calendars")
    op.drop_table("trips")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
    op.drop_index(op.f("ix_destinations_name"), table_name="destinations")
    op.drop_table("destinations")
